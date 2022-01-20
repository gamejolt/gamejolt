<script lang="ts">
import { inject, InjectionKey, PropType, provide, ref } from 'vue';
import { ScrollInviewConfig, ScrollInviewController } from './AppScrollInview.vue';

const Key: InjectionKey<ScrollInviewParentController> = Symbol('scroll-inview-parent');

export type ScrollInviewParentController = ReturnType<typeof createScrollInviewParent>;

export function useScrollInviewParent() {
	return inject(Key, null);
}

function createScrollInviewParent(scroller: HTMLElement | null) {
	/**
	 * We need to create a new container for each unique configuration that
	 * our AppScrollInview children need.
	 */
	const containers = ref(new Map<ScrollInviewConfig, ScrollInviewContainer>());

	/**
	 * We need a different container for each unique "margin" that we need
	 * to watch for. This function will return a container for the specific
	 * margin passed in. If it doesn't have one yet for the specific margin,
	 * it will dynamically create one.
	 */
	function getContainer(config: ScrollInviewConfig) {
		const container = containers.value.get(config);
		if (!container) {
			const root = scroller;
			const newContainer = createScrollInviewContainer(config, root);
			containers.value.set(config, newContainer);
			return newContainer;
		}

		return container;
	}

	const c = {
		containers,
		getContainer,
	};
	provide(Key, c);
	return c;
}

type ScrollInviewContainer = ReturnType<typeof createScrollInviewContainer>;

function createScrollInviewContainer(config: ScrollInviewConfig, root: Element | null) {
	const _items = new WeakMap<Element, ScrollInviewController>();
	const _controllers = new Set<ScrollInviewController>();

	let _queuedChanges: (() => void)[] = [];

	/**
	 * Gets called by the IntersectionObserver any time at least some entries
	 * are updated.
	 */
	const _processUpdatedEntries: IntersectionObserverCallback = entries => {
		for (const entry of entries) {
			const { intersectionRatio, isIntersecting, target } = entry;
			const item = _items.get(target);
			if (!item) {
				continue;
			}

			// If the item is in strict mode, then it has to be 100% visible for
			// it to be considered in view, and we can use the intersectionRatio
			// value for this case. Otherwise, we can just use the
			// isIntersecting variable which will be true if any of the element
			// is visible.
			const isInView =
				config.emitsOn === 'full-overlap' ? intersectionRatio === 1 : isIntersecting;

			_queueChange(() => {
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

		if (config.trackFocused) {
			_queueChange(() => _trackFocused());
		}
	};

	const _observer = new IntersectionObserver(_processUpdatedEntries, {
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

	function _queueChange(cb: () => void) {
		// Queue up the changes to be processed next animation frame. We will
		// process them all at once.
		_queuedChanges.push(cb);
		if (_queuedChanges.length === 1) {
			window.requestAnimationFrame(_processQueue);
		}
	}

	const _processQueue = () => {
		for (const cb of _queuedChanges) {
			cb();
		}
		_queuedChanges = [];
	};

	function _trackFocused() {
		let focusedItem: ScrollInviewController | null = null;

		// Loop over trying to find the new active.
		for (const i of _controllers) {
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

	return {
		observeItem(item: ScrollInviewController) {
			_items.set(item.element!, item);
			_controllers.add(item);
			_observer.observe(item.element!);
		},
		unobserveItem(item: ScrollInviewController) {
			const { element } = item;
			if (element) {
				_items.delete(element);
				_observer.unobserve(element);
			}
			_controllers.delete(item);
			_trackFocused();
		},
	};
}
</script>

<script lang="ts" setup>
const props = defineProps({
	// If this is a child of AppScrollScroller, we need to get it as a prop so
	// we can use that scroll element as the root context.
	scrollElement: {
		type: Object as PropType<HTMLElement>,
		default: null,
	},
});

createScrollInviewParent(props.scrollElement);
</script>

<template>
	<slot />
</template>
