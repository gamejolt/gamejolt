import { arrayRemove } from '../../../utils/array';
import { DrawerStore } from '../../drawer/drawer-store';
import AppScrollScroller from '../../scroll/scroller/scroller';
import AppStickerTarget from '../target/target';
import { StickerTargetController } from '../target/target-controller';

export const StickerLayerKey = Symbol('sticker-layer');

export class StickerLayerController {
	relativeScrollTop = 0;
	scroller: null | AppScrollScroller = null;
	targets: AppStickerTarget[] = [];
	hoveredTarget: null | AppStickerTarget = null;
	rects = new WeakMap<AppStickerTarget, StickerLayerTargetRect>();

	constructor(public readonly drawer: DrawerStore) {}

	get isActive() {
		return this.drawer.activeLayer === this;
	}

	get isShowingDrawer() {
		return this.drawer.isDrawerOpen && !this.drawer.hideDrawer && this.isActive;
	}
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
	targetController.layer = controller;
	controller.targets.push(target);
}

export function unregisterStickerTarget(
	controller: StickerLayerController,
	target: AppStickerTarget,
	targetController: StickerTargetController
) {
	const { targets, hoveredTarget } = controller;

	targetController.layer = null;
	arrayRemove(targets, i => i === target);
	if (hoveredTarget === target) {
		controller.hoveredTarget = null;
	}
}

export function calculateStickerTargetRects(
	controller: StickerLayerController,
	scrollLeft: number,
	scrollTop: number
) {
	controller.rects = new WeakMap(
		controller.targets.map(target => {
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
	return rects.get(target);
}

export function getCollidingStickerTarget(
	{ targets, rects }: StickerLayerController,
	pointerX: number,
	pointerY: number
) {
	return targets.find(i => {
		const rect = rects.get(i);
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
