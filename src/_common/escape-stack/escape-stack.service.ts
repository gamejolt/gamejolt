import { MaybeRefOrGetter, onMounted, onUnmounted, toRef, watch } from 'vue';
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

export function useEscapeStack(options: {
	handler: () => void;
	disable?: MaybeRefOrGetter<boolean>;
}) {
	const { handler } = options;
	const disable = toRef(options.disable);
	let isRegistered = false;

	onMounted(() => {
		if (disable.value) {
			return;
		}

		EscapeStack.register(handler);
		isRegistered = true;
	});

	watch(disable, value => {
		if (value && isRegistered) {
			EscapeStack.deregister(handler);
			isRegistered = false;
		} else if (!value && !isRegistered) {
			EscapeStack.register(handler);
			isRegistered = true;
		}
	});

	onUnmounted(() => {
		if (!isRegistered) {
			return;
		}
		EscapeStack.deregister(handler);
	});
}
