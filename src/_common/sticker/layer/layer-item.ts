import { PointerPosition } from '../sticker-store';
import { StickerTargetController } from '../target/target-controller';
import { StickerLayerTargetRect } from './layer-controller';

export class StickerLayerItem {
	constructor(
		public readonly controller: StickerTargetController,
		public readonly getRect: () => StickerLayerTargetRect,
		public readonly onPlaceDrawerSticker: (pointer: PointerPosition) => void
	) {}
}
