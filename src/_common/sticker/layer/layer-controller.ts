import { arrayRemove } from '../../../utils/array';
import AppStickerTarget from '../target/target';

export const StickerLayerKey = Symbol('sticker-layer');

export class StickerLayerController {
	targets: AppStickerTarget[] = [];
}

export function registerStickerTarget(
	{ targets }: StickerLayerController,
	target: AppStickerTarget
) {
	targets.push(target);
}

export function unregisterStickerTarget(
	{ targets }: StickerLayerController,
	target: AppStickerTarget
) {
	arrayRemove(targets, i => i === target);
}
