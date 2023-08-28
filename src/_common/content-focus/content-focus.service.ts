import { computed, ref, shallowReadonly } from 'vue';
import { arrayRemove } from '../../utils/array';
import { Modals } from '../modal/modal.service';

type ContentFocusService = ReturnType<typeof createContentFocusService>;

function createContentFocusService() {
	const isWindowFocused = ref(
		typeof document !== 'undefined' && document.hasFocus ? document.hasFocus() : true
	);

	const _watchers = ref<(() => boolean)[]>([]);

	const isModalOpen = computed(() => Modals.modals.length > 0);
	const hasContentFocus = computed(
		() => isWindowFocused.value && !isModalOpen.value && _watchers.value.every(i => i())
	);

	return shallowReadonly({
		isWindowFocused,
		hasContentFocus,
		/**
		 * Watchers are functions that we call to check to see if we have focus.
		 * They can be used to say that the content isn't focused for
		 * section-specific situations.
		 */
		_watchers,
	});
}

let _contentFocusService: ContentFocusService | undefined;

export function useContentFocusService() {
	if (!_contentFocusService) {
		_contentFocusService = createContentFocusService();

		const { isWindowFocused } = _contentFocusService;

		if (typeof window !== 'undefined') {
			window.addEventListener('focus', () => (isWindowFocused.value = true));
			window.addEventListener('blur', () => (isWindowFocused.value = false));
		}
	}

	return _contentFocusService;
}

export function registerContentFocusWatcher(cb: () => boolean) {
	const { _watchers: watchers } = useContentFocusService();
	watchers.value.push(cb);

	// This is a deregistration function.
	return () => {
		arrayRemove(watchers.value, i => i === cb);
	};
}
