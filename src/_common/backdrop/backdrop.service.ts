import { inject, InjectionKey, reactive, ref, shallowReadonly } from 'vue';

import { arrayRemove } from '~utils/array';

interface BackdropOptions {
	context?: HTMLElement | string;
	className?: string;
}

function createBackdrop(
	options: BackdropOptions & {
		remove: () => void;
	}
) {
	return reactive({
		className: options.className,
		context: options.context,
		remove: options.remove,
		onClicked: ref<(() => void) | null>(null),
	});
}

export type BackdropController = ReturnType<typeof createBackdrop>;

export type BackdropStore = ReturnType<typeof createBackdropStore>;

export const BackdropStoreKey: InjectionKey<BackdropStore> = Symbol('backdrop-store');

export function useBackdropStore() {
	return inject(BackdropStoreKey)!;
}

export function createBackdropStore() {
	const backdrops = ref<BackdropController[]>([]);

	function push(options: BackdropOptions): BackdropController | null {
		// Backdrops are a DOM concept (they toggle a class on `document.body`
		// and pad `.backdrop-affected` elements). SSR has no DOM, so skip.
		if (import.meta.env.SSR) {
			return null;
		}

		const scrollbarWidth = window.innerWidth - document.body.clientWidth;
		const backdrop = createBackdrop({
			...options,
			remove: () => _remove(backdrop),
		}) as BackdropController;

		backdrops.value.push(backdrop);
		document.body.classList.add('backdrop-active');

		// Take up the space that the scrollbar was taking so that things don't
		// shift to the right when showing a backdrop.
		document.body.style.marginRight = scrollbarWidth + 'px';
		document.querySelectorAll('.backdrop-affected').forEach(i => {
			if (i instanceof HTMLElement) {
				i.style.paddingRight = scrollbarWidth + 'px';
			}
		});

		return backdrop;
	}

	function _remove(backdrop: BackdropController) {
		arrayRemove(backdrops.value, i => i === backdrop);
		_checkBackdrops();
	}

	function _checkBackdrops() {
		if (backdrops.value.length !== 0) {
			return;
		}

		document.body.classList.remove('backdrop-active');

		// Now we have to remove the spacing that we took up when we pushed
		// the backdrop onto the page.
		document.body.style.marginRight = '';
		document.querySelectorAll('.backdrop-affected').forEach(i => {
			if (i instanceof HTMLElement) {
				i.style.paddingRight = '';
			}
		});
	}

	return shallowReadonly({
		backdrops,
		push,
	});
}
