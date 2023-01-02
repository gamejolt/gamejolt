import { onMounted, onUnmounted } from 'vue';
import { arrayRemove } from '../../utils/array';

type ShortkeyCallback = (e: KeyboardEvent) => void;

export class Shortkeys {
	public static enabled = true;

	private static _bootstrapped = false;
	private static _handlers: { [key: string]: ShortkeyCallback[] } = {};

	private static bootstrap() {
		this._bootstrapped = true;
		document.addEventListener('keydown', this.eventHandler.bind(this));
	}

	public static register(key: string, callback: ShortkeyCallback) {
		if (!this._bootstrapped) {
			this.bootstrap();
		}

		if (this._handlers[key]) {
			this._handlers[key].push(callback);
		} else {
			this._handlers[key] = [callback];
		}
	}

	public static unregister(key: string, callback: ShortkeyCallback) {
		if (this._bootstrapped && this._handlers[key]) {
			arrayRemove(this._handlers[key], i => i === callback);
		}
	}

	private static eventHandler(e: KeyboardEvent) {
		if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) {
			return;
		}
		const activeElement = document.activeElement;
		if (activeElement) {
			const tagName = activeElement.tagName.toLowerCase();

			// Don't fire for these elements ever.
			// Adding a `data-prevent-shortkey` attribute to an element will prevent shortkeys from firing when that element is focused.
			if (
				tagName === 'input' ||
				tagName === 'textarea' ||
				tagName === 'select' ||
				activeElement.hasAttribute('data-prevent-shortkey')
			) {
				return;
			}
		}

		const handlers = this._handlers[e.key.toLowerCase()];
		if (handlers) {
			for (const handler of handlers) {
				handler(e);
			}
			e.preventDefault();
		}
	}
}

export function useShortkey(key: string, callback: ShortkeyCallback) {
	let _isRegistered = false;

	onMounted(() => {
		Shortkeys.register(key, callback);
		_isRegistered = true;
	});

	onUnmounted(unregister);

	function unregister() {
		if (!_isRegistered) {
			return;
		}
		Shortkeys.unregister(key, callback);
		_isRegistered = false;
	}

	return {
		unregister,
	};
}
