import { Directive } from 'vue';

const observers = new WeakMap<HTMLElement, ResizeObserver>();

export const vAppObserveDimensions: Directive<unknown, ResizeObserverCallback> = {
	mounted(el: HTMLElement, binding) {
		const observer = new ResizeObserver(binding.value);
		observer.observe(el);
		observers.set(el, observer);
	},
	unmounted(el: HTMLElement) {
		const observer = observers.get(el);
		if (observer) {
			observer.disconnect();
			observers.delete(el);
		}
	},
};
