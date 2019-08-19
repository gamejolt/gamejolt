import { arrayRemove } from '../../utils/array';

export class EscapeStack {
	static stack: Function[] = [];
	private static initialized = false;

	static register(cb: Function) {
		this.stack.push(cb);
		this.init();
	}

	static deregister(cb: Function) {
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
