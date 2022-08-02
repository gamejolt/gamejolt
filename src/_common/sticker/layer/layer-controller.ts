import { InjectionKey, shallowRef } from '@vue/runtime-core';
import { computed, ComputedRef, inject, provide, ref, Ref, ShallowRef, toRaw } from 'vue';
import { arrayRemove } from '../../../utils/array';
import { ScrollController } from '../../scroll/AppScrollScroller.vue';
import { StickerStore } from '../sticker-store';
import { StickerLayerItem } from './layer-item';

const StickerLayerKey: InjectionKey<StickerLayerController> = Symbol('sticker-layer');

export type StickerLayerController = {
	scroller: ShallowRef<ScrollController | null>;

	hoveredTarget: ShallowRef<StickerLayerItem | null>;
	cachedRects: Ref<WeakMap<StickerLayerItem, StickerLayerTargetRect>>;
	layerItems: ShallowRef<StickerLayerItem[]>;

	isShowingDrawer: ComputedRef<boolean>;
	drawer: StickerStore;
};

export function createStickerLayerController(drawer: StickerStore) {
	const scroller: StickerLayerController['scroller'] = shallowRef<ScrollController | null>(null);

	const hoveredTarget: StickerLayerController['hoveredTarget'] = shallowRef(null);
	const cachedRects: StickerLayerController['cachedRects'] = ref(new WeakMap());
	const layerItems: StickerLayerController['layerItems'] = shallowRef([]);

	const _isActive = computed(() => toRaw(drawer.activeLayer.value) === toRaw(c));

	const isShowingDrawer = computed(
		() => drawer.isDrawerOpen.value && !drawer.hideDrawer.value && _isActive.value
	);

	const c: StickerLayerController = {
		scroller,
		hoveredTarget,
		cachedRects,
		layerItems,
		isShowingDrawer,
		drawer,
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
