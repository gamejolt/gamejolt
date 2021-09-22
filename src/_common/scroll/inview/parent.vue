<script lang="ts">
import { inject, InjectionKey, provide, reactive } from 'vue';
import { ScrollInviewConfig, ScrollInviewController } from './inview.vue';

const Key: InjectionKey<ScrollInviewParentController> = Symbol('scroll-inview-parent');

export type ScrollInviewParentController = ReturnType<typeof createScrollInviewParent>;

export function createScrollInviewParent(scroller: HTMLElement | null) {
	return reactive({
		/**
		 * We need to create a new container for each unique configuration that
		 * our AppScrollInview children need.
		 */
		containers: new Map<ScrollInviewConfig, ScrollInviewContainer>(),

		/**
		 * We need a different container for each unique "margin" that we need
		 * to watch for. This function will return a container for the specific
		 * margin passed in. If it doesn't have one yet for the specific margin,
		 * it will dynamically create one.
		 */
		getContainer(config: ScrollInviewConfig) {
			const container = this.containers.get(config);
			if (!container) {
				const root = scroller;
				const newContainer = new ScrollInviewContainer(config, root);
				this.containers.set(config, newContainer);
				return newContainer;
			}

			return container;
		},
	});
}

export function useScrollInviewParent() {
	return inject(Key, null);
}

export class ScrollInviewContainer {
	private items = new WeakMap<Element, ScrollInviewController>();
	private controllers = new Set<ScrollInviewController>();
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

	observeItem(item: ScrollInviewController) {
		this.items.set(item.element!, item);
		this.controllers.add(item);
		this.observer.observe(item.element!);
	}

	unobserveItem(item: ScrollInviewController) {
		const { element } = item;
		if (element) {
			this.items.delete(element);
			this.observer.unobserve(element);
		}

		this.controllers.delete(item);
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
				item.latestThreshold = intersectionRatio;
				if (isInView !== item.isInview) {
					item.isInview = isInView;
					if (isInView) {
						item.emitChange(true);
					} else {
						item.emitChange(false);
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

		// Loop over trying to find the new active.
		for (const i of this.controllers) {
			focusedItem =
				i.latestThreshold >= 0.5 &&
				(!focusedItem || i.latestThreshold > focusedItem.latestThreshold)
					? i
					: focusedItem;

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
</script>

<script lang="ts" setup>
const props = defineProps({
	// If this is a child of AppScrollScroller, we need to get it as a prop so
	// we can use that scroll element as the root context.
	scroller: {
		type: HTMLElement,
		default: null,
	},
});

const c = createScrollInviewParent(props.scroller);
provide(Key, c);
</script>

<template>
	<!-- TODO(vue3): do we need the div? -->
	<div>
		<slot />
	</div>
</template>
