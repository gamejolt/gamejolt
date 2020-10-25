import { arrayRemove } from '../../../utils/array';
import { ScrollInviewConfig } from './config';
import { ScrollInviewController } from './controller';
import { AppScrollInview } from './inview';

export class ScrollInviewContainer {
	private items = new WeakMap<Element, AppScrollInview>();
	private controllers: ScrollInviewController[] = [];
	private observer: IntersectionObserver = null as any;
	private queuedChanges: (() => void)[] = [];

	constructor(private readonly config: ScrollInviewConfig, root: Element | null) {
		this.observer = new IntersectionObserver(this.processUpdatedEntries, {
			root,
			rootMargin: config.margin,
			// Some components need to react on when an element is fully in view
			// vs just partially (see 'emits-on' prop in AppScrollInview). For
			// this reason we need to set both 1 and 0 thresholds. A threshold
			// of 1 triggers when an element becomes fully in view or goes
			// partially out of view. A threshold of 0 triggers when an element
			// becomes partially in view or goes completely out of view.
			threshold: [1, 0.75, 0.5, 0.25, 0],
		});
	}

	observeItem(item: AppScrollInview) {
		this.items.set(item.$el, item);
		this.controllers.push(item.controller);
		this.observer.observe(item.$el);
	}

	unobserveItem(item: AppScrollInview) {
		this.items.delete(item.$el);
		arrayRemove(this.controllers, i => i === item.controller);
		this.observer.unobserve(item.$el);
		this.trackFocused();
	}

	/**
	 * Gets called by the IntersectionObserver any time at least some entries
	 * are updated.
	 */
	private processUpdatedEntries: IntersectionObserverCallback = entries => {
		for (const entry of entries) {
			const { intersectionRatio, isIntersecting, target } = entry;
			const item = this.items.get(target);
			if (!item) {
				continue;
			}

			// If the item is in strict mode, then it has to be 100% visible for
			// it to be considered in view, and we can use the intersectionRatio
			// value for this case. Otherwise, we can just use the
			// isIntersecting variable which will be true if any of the element
			// is visible.
			const isInView =
				this.config.emitsOn === 'full-overlap' ? intersectionRatio === 1 : isIntersecting;

			this.queueChange(() => {
				item.controller.latestThreshold = intersectionRatio;
				if (isInView !== item.controller.isInview) {
					item.controller.isInview = isInView;
					if (isInView) {
						item.emitInView();
					} else {
						item.emitOutView();
					}
				}
			});
		}

		if (this.config.trackFocused) {
			this.queueChange(() => this.trackFocused());
		}
	};

	private queueChange(cb: () => void) {
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

	private trackFocused() {
		let focusedItem: ScrollInviewController | null = null;
		for (const i of this.controllers) {
			// Loop over trying to find the new active.
			focusedItem =
				!focusedItem || i.latestThreshold > focusedItem.latestThreshold ? i : focusedItem;

			// Reset the active state of any ones currently marked as active.
			// There should only ever be one.
			if (i.isFocused) {
				i.isFocused = false;
			}
		}

		// Set the new active item.
		if (focusedItem) {
			focusedItem.isFocused = true;
		}
	}
}
