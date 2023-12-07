import { onMounted, onUnmounted } from 'vue';
import { arrayRemove } from '../../utils/array';

export type EscapeStackCallback = () => void;

class EscapeStackService {
	stack: EscapeStackCallback[] = [];
	private initialized = false;

	register(cb: EscapeStackCallback) {
		this.stack.push(cb);
		this.init();
	}

	deregister(cb: EscapeStackCallback) {
		arrayRemove(this.stack, i => i === cb);
	}

	private handle(e: KeyboardEvent) {
		if (e.key !== 'Escape') {
			return;
		}

		const top = this.stack[this.stack.length - 1];
		if (top) {
			top();
		}
	}

	private init() {
		if (this.initialized) {
			return;
		}

		document.addEventListener('keydown', e => this.handle(e));
		this.initialized = true;
	}
}

export const EscapeStack = /** @__PURE__ */ new EscapeStackService();

export function useEscapeStack(cb: () => void) {
	onMounted(() => {
		EscapeStack.register(cb);
	});

	onUnmounted(() => {
		EscapeStack.deregister(cb);
	});
}
