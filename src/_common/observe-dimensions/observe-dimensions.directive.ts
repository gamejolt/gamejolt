import { ResizeObserver } from 'resize-observer';
import { DirectiveOptions } from 'vue';

const observers = new WeakMap<HTMLElement, ResizeObserver>();

export const AppObserveDimensions: DirectiveOptions = {
	inserted(el, binding) {
		const observer = new ResizeObserver(binding.value);
		observer.observe(el);
		observers.set(el, observer);
	},
	unbind(el) {
		const observer = observers.get(el);
		if (observer) {
			observer.disconnect();
			observers.delete(el);
		}
	},
};
