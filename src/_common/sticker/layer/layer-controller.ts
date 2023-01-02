import { InjectionKey, shallowRef } from '@vue/runtime-core';
import { computed, ComputedRef, inject, provide, ref, Ref, ShallowRef, toRaw } from 'vue';
import { arrayRemove } from '../../../utils/array';
import { ScrollController } from '../../scroll/AppScrollScroller.vue';
import { isStickerTargetMine, StickerStore } from '../sticker-store';
import { StickerLayerItem } from './layer-item';

const StickerLayerKey: InjectionKey<StickerLayerController> = Symbol('sticker-layer');

export type StickerLayerController = {
	scroller: ShallowRef<ScrollController | null>;

	hoveredTarget: ShallowRef<StickerLayerItem | null>;
	cachedRects: Ref<WeakMap<StickerLayerItem, StickerLayerTargetRect>>;
	layerItems: ShallowRef<StickerLayerItem[]>;

	isActive: Ref<boolean>;
	isMask: Ref<boolean>;
	isShowingDrawer: ComputedRef<boolean>;
	isAllCreator: ComputedRef<boolean>;

	preferredMask: ComputedRef<StickerLayerController>;

	store: StickerStore;
};

export function createStickerLayerController(store: StickerStore) {
	const scroller: StickerLayerController['scroller'] = shallowRef<ScrollController | null>(null);

	const hoveredTarget: StickerLayerController['hoveredTarget'] = shallowRef(null);
	const cachedRects: StickerLayerController['cachedRects'] = ref(new WeakMap());
	const layerItems: StickerLayerController['layerItems'] = shallowRef([]);

	/**
	 * If this layer is eligible to show sticker target cutouts. Allows us to
	 * "disable" layers under certain conditions so they're not able to be
	 * automatically selected as the active layer.
	 */
	const isActive = ref(true);

	/**
	 * If this layer is the one that will be showing the mask and handling
	 * sticker ghost callbacks. Used so that modals offset events by their own
	 * scroll values instead of the rest of the document.
	 */
	const isMask = ref(true);

	/**
	 * If this is the layer currently showing sticker target rects.
	 */
	const _isActiveLayer = computed(() => toRaw(store.activeLayer.value) === toRaw(c));

	const isShowingDrawer = computed(
		() => store.isDrawerOpen.value && !store.hideDrawer.value && _isActiveLayer.value
	);

	/**
	 * Returns true if all sticker targets in the layer belong to a creator and
	 * none of the targets belong to us.
	 */
	const isAllCreator = computed(
		() =>
			layerItems.value.length > 0 &&
			layerItems.value.every(
				i => !isStickerTargetMine(store, i.controller) && i.controller.isCreator.value
			)
	);

	const preferredMask = computed(() => {
		if (isMask.value) {
			return c;
		}

		const myIndex = store.layers.indexOf(c);
		if (myIndex === -1) {
			return store.layers[0] || c;
		}

		for (let i = myIndex; myIndex > 0; --i) {
			const layer = store.layers[i - 1];
			if (!layer || !layer.isMask.value) {
				continue;
			}

			return layer;
		}

		return c;
	});

	const c: StickerLayerController = {
		scroller,

		hoveredTarget,
		cachedRects,
		layerItems,

		isActive,
		isMask,
		isShowingDrawer,
		isAllCreator,

		preferredMask,

		store,
	};
	return c;
}

export function provideStickerLayer(controller?: StickerLayerController | null) {
	return provide(StickerLayerKey, controller);
}

export function useStickerLayer() {
	return inject(StickerLayerKey) || null;
}

export class StickerLayerTargetRect {
	constructor(
		public readonly x: number,
		public readonly y: number,
		public readonly width: number,
		public readonly height: number
	) {}
}

export function registerStickerTarget(
	controller: StickerLayerController,
	target: StickerLayerItem
) {
	target.controller.layer.value = controller;
	controller.layerItems.value.push(target);
}

export function unregisterStickerTarget(
	layerController: StickerLayerController,
	target: StickerLayerItem
) {
	const { layerItems, hoveredTarget } = layerController;
	const rawTarget = toRaw(target);

	target.controller.layer.value = null;
	arrayRemove(layerItems.value, i => toRaw(i) === rawTarget);

	if (rawTarget === toRaw(hoveredTarget.value)) {
		hoveredTarget.value = null;
	}
}

export function calculateStickerTargetRects(
	layerController: StickerLayerController,
	scrollLeft: number,
	scrollTop: number
) {
	layerController.cachedRects.value = new WeakMap(
		layerController.layerItems.value.map(target => {
			const { x, y, width, height } = target.getRect();
			// We need to add this scroll distance since getBoundingClientRect()
			// returns x/y from the left/top of the window instead of the page.
			// Return as an "entry" so that WeakMap will use target as key and
			// rect as the value.
			return [
				target,
				new StickerLayerTargetRect(x + scrollLeft, y + scrollTop, width, height),
			];
		})
	);
}

export function getRectForStickerTarget(
	{ cachedRects }: StickerLayerController,
	target: StickerLayerItem
) {
	return cachedRects.value.get(target);
}

export function getCollidingStickerTarget(
	{ layerItems, cachedRects }: StickerLayerController,
	pointerX: number,
	pointerY: number
) {
	return layerItems.value.find(i => {
		const rect = cachedRects.value.get(i);
		if (!rect) {
			return false;
		}

		const { x, y, width, height } = rect;

		const relX = pointerX - x;
		const relY = pointerY - y;

		const xWithinBounds = 0 <= relX && relX <= width;
		const yWithinBounds = 0 <= relY && relY <= height;

		return xWithinBounds && yWithinBounds;
	});
}
