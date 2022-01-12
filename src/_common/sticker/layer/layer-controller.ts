import { InjectionKey } from '@vue/runtime-core';
import { computed, ComputedRef, inject, provide, ref, Ref, toRaw } from 'vue';
import { arrayRemove } from '../../../utils/array';
import { DrawerStore } from '../../drawer/drawer-store';
import { ScrollController } from '../../scroll/scroller/scroller.vue';
import { StickerTargetController } from '../target/target-controller';
import AppStickerTarget from '../target/target.vue';

const StickerLayerKey: InjectionKey<StickerLayerController> = Symbol('sticker-layer');

export type StickerLayerController = {
	relativeScrollTop: Ref<number>;
	scroller: Ref<ScrollController | null>;

	targets: Ref<AppStickerTarget[]>;
	hoveredTarget: Ref<AppStickerTarget | null>;
	rects: Ref<WeakMap<AppStickerTarget, StickerLayerTargetRect>>;

	// isActive: ComputedRef<boolean>;
	isShowingDrawer: ComputedRef<boolean>;
	drawer: DrawerStore;
};

export function createStickerLayerController(drawer: DrawerStore) {
	const relativeScrollTop = ref(0);
	const scroller = ref<ScrollController | null>(null);

	const targets = ref<AppStickerTarget[]>([]);
	const hoveredTarget = ref<AppStickerTarget | null>(null);
	const rects = ref(new WeakMap<AppStickerTarget, StickerLayerTargetRect>());

	const _isActive = computed<boolean>(() => {
		return toRaw(drawer.activeLayer.value) === toRaw(c);
	});

	const isShowingDrawer = computed(() => {
		return drawer.isDrawerOpen.value && !drawer.hideDrawer.value && _isActive.value;
	});

	const c: StickerLayerController = {
		relativeScrollTop,
		scroller,
		targets,
		hoveredTarget,
		rects,
		// isActive,
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
	target: AppStickerTarget,
	targetController: StickerTargetController
) {
	targetController.layer.value = controller;
	controller.targets.value.push(target);
}

export function unregisterStickerTarget(
	controller: StickerLayerController,
	target: AppStickerTarget,
	targetController: StickerTargetController
) {
	const { targets, hoveredTarget } = controller;
	const rawTarget = toRaw(target);

	targetController.layer.value = null;
	arrayRemove(targets.value, i => toRaw(i) === rawTarget);
	if (toRaw(hoveredTarget.value) === rawTarget) {
		controller.hoveredTarget.value = null;
	}
}

export function calculateStickerTargetRects(
	controller: StickerLayerController,
	scrollLeft: number,
	scrollTop: number
) {
	controller.rects.value = new WeakMap(
		controller.targets.value.map(target => {
			const { x, y, width, height } = target.$el.getBoundingClientRect();

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
	{ rects }: StickerLayerController,
	target: AppStickerTarget
) {
	return rects.value.get(target);
}

export function getCollidingStickerTarget(
	{ targets, rects }: StickerLayerController,
	pointerX: number,
	pointerY: number
) {
	return targets.value.find(i => {
		const rect = rects.value.get(i);
		if (!rect) {
			return false;
		}

		const { x, y, width, height } = rect;

		return (
			pointerX! - x < width &&
			pointerY! - y < height &&
			pointerX! - x > 0 &&
			pointerY! - y > 0
		);
	});
}
