import { Modal } from '../../lib/gj-lib-client/components/modal/modal.service';
import { makeObservableService } from '../../lib/gj-lib-client/utils/vue';

if (typeof window !== 'undefined') {
	window.addEventListener('focus', () => (ContentFocus.isWindowFocused = true));
	window.addEventListener('blur', () => (ContentFocus.isWindowFocused = false));
}

export class ContentFocus {
	static isWindowFocused = typeof document !== 'undefined' && document.hasFocus
		? document.hasFocus()
		: true;

	/**
	 * Watchers are functions that we call to check to see if we have focus. They can be used to say
	 * that the content isn't focused for section-specific situations.
	 */
	private static watchers: (() => boolean)[] = [];

	static registerWatcher(cb: () => boolean) {
		this.watchers.push(cb);
	}

	static get hasFocus() {
		return this.isWindowFocused && !this.isModalOpen && this.watchers.every(i => i());
	}

	static get isModalOpen() {
		return Modal.modals.length > 0;
	}
}

makeObservableService(ContentFocus);
