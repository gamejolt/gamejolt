import { reactive } from 'vue';
import { arrayRemove } from '../../utils/array';
import { Modals } from '../modal/modal.service';

class ContentFocusService {
	isWindowFocused =
		typeof document !== 'undefined' && document.hasFocus ? document.hasFocus() : true;

	/**
	 * Watchers are functions that we call to check to see if we have focus.
	 * They can be used to say that the content isn't focused for
	 * section-specific situations.
	 */
	watchers: (() => boolean)[] = [];

	get hasFocus() {
		return this.isWindowFocused && !this.isModalOpen && this.watchers.every(i => i());
	}

	get isModalOpen() {
		return Modals.modals.length > 0;
	}
}

export const ContentFocus = reactive(
	/** @__PURE__ */ new ContentFocusService()
) as ContentFocusService;

// TODO(chunk-optimization): Put this in an initializer so that it's not a side effect.
if (typeof window !== 'undefined') {
	window.addEventListener('focus', () => (ContentFocus.isWindowFocused = true));
	window.addEventListener('blur', () => (ContentFocus.isWindowFocused = false));
}

export function registerContentFocusWatcher(service: ContentFocusService, cb: () => boolean) {
	service.watchers.push(cb);

	// This is a deregistration function.
	return () => {
		arrayRemove(service.watchers, i => i === cb);
	};
}
