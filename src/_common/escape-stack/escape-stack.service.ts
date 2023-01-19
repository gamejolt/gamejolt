import { onMounted, onUnmounted } from 'vue';
import { arrayRemove } from '../../utils/array';

export type EscapeStackCallback = () => void;

export class EscapeStack {
	static stack: EscapeStackCallback[] = [];
	private static initialized = false;

	static register(cb: EscapeStackCallback) {
		this.stack.push(cb);
		this.init();
	}

	static deregister(cb: EscapeStackCallback) {
		arrayRemove(this.stack, i => i === cb);
	}

	private static handle(e: KeyboardEvent) {
		if (e.key !== 'Escape') {
			return;
		}

		const top = this.stack[this.stack.length - 1];
		if (top) {
			top();
		}
	}

	private static init() {
		if (this.initialized) {
			return;
		}

		document.addEventListener('keydown', e => this.handle(e));
		this.initialized = true;
	}
}

export function useEscapeStack(cb: () => void) {
	onMounted(() => {
		EscapeStack.register(cb);
	});

	onUnmounted(() => {
		EscapeStack.deregister(cb);
	});
}
