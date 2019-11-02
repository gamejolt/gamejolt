import { AppScrollInview } from './inview';

export class ScrollInviewContainer {
	private items = new WeakMap<Element, AppScrollInview>();
	private observer: IntersectionObserver = null as any;
	private queuedChanges: Function[] = [];

	constructor(root: Element | null, public readonly rootMargin: string) {
		this.observer = new IntersectionObserver(this.processUpdatedEntries, {
			root,
			rootMargin,
			// We set two thresholds so that we can support the case of "strict"
			// items. They need to know if any part of the item is out of view,
			// which a threshold of 1 will tell us. The threshold of 0 will
			// trigger when all of the item is out of view so that we can check
			// for the non-strict case that needs all of the item out of view in
			// order to trigger.
			threshold: [1, 0],
		});
	}

	observeItem(item: AppScrollInview) {
		this.items.set(item.$el, item);
		this.observer.observe(item.$el);
	}

	unobserveItem(item: AppScrollInview) {
		this.items.delete(item.$el);
		this.observer.unobserve(item.$el);
	}

	/**
	 * Gets called by the IntersectionObserver any time at least some entries
	 * are updated.
	 */
	private processUpdatedEntries: IntersectionObserverCallback = (entries, observer) => {
		for (const entry of entries) {
			// console.log('entry', entry.intersectionRatio, entry.isIntersecting);
			const item = this.items.get(entry.target);
			if (!item) {
				continue;
			}

			// If the item is in strict mode, then it has to be 100% visible for
			// it to be considered in view, and we can use the intersectionRatio
			// value for this case. Otherwise, we can just use the
			// isIntersecting variable which will be true if any of the element
			// is visible.
			const isInView = item.strict ? entry.intersectionRatio === 1 : entry.isIntersecting;
			// console.log('calculated inview', isInView, observer.rootMargin, observer.root);

			if (isInView !== item.inView) {
				this.queueChange(() => (item.inView = isInView));
			}
		}
	};

	private queueChange(cb: Function) {
		// Queue up the changes to be processed next animation frame. We will
		// process them all at once.
		this.queuedChanges.push(cb);
		if (this.queuedChanges.length === 1) {
			window.requestAnimationFrame(this.processQueue);
		}
	}

	private processQueue = () => {
		for (const cb of this.queuedChanges) {
			cb();
		}
		this.queuedChanges = [];
	};
}
