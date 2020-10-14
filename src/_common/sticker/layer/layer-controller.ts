import { arrayRemove } from '../../../utils/array';
import AppStickerTarget from '../target/target';

export const StickerLayerKey = Symbol('sticker-layer');

export class StickerLayerController {
	targets: AppStickerTarget[] = [];
	hoveredTarget: null | AppStickerTarget = null;
	rects = new WeakMap<AppStickerTarget, TargetRect>();
}

class TargetRect {
	constructor(
		public readonly x: number,
		public readonly y: number,
		public readonly width: number,
		public readonly height: number
	) {}
}

export function registerStickerTarget(
	{ targets }: StickerLayerController,
	target: AppStickerTarget
) {
	targets.push(target);
}

export function unregisterStickerTarget(
	controller: StickerLayerController,
	target: AppStickerTarget
) {
	const { targets, hoveredTarget } = controller;

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
			return [target, new TargetRect(x + scrollLeft, y + scrollTop, width, height)];
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
