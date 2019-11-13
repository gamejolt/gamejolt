import { AppScrollInview } from './inview';

export class ScrollInviewContainer {
	private items = new WeakMap<Element, AppScrollInview>();
	private observer: IntersectionObserver = null as any;
	private queuedChanges: Function[] = [];

	constructor(root: Element | null, rootMargin: string) {
		this.observer = new IntersectionObserver(this.processUpdatedEntries, {
			root,
			rootMargin,
			// Some components need to react on when an element is fully in view vs just partially
			// (see 'emits-on' prop in AppScrollInview). For this reason we need to set both 1 and 0 thresholds.
			// A threshold of 1 triggers when an element becomes fully in view or goes partially out of view.
			// A threshold of 0 triggers when an element becomes partially in view or goes completely out of view.
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
	private processUpdatedEntries: IntersectionObserverCallback = entries => {
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
