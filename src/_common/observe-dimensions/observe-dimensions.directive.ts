import ResizeObserver from 'resize-observer-polyfill';
import { Directive } from 'vue';

const observers = new WeakMap<HTMLElement, ResizeObserver>();

export const vAppObserveDimensions: Directive<HTMLElement, ResizeObserverCallback> = {
	mounted(el, binding) {
		const observer = new ResizeObserver(binding.value);
		observer.observe(el);
		observers.set(el, observer);
	},
	unmounted(el) {
		const observer = observers.get(el);
		if (observer) {
			observer.disconnect();
			observers.delete(el);
		}
	},
};
