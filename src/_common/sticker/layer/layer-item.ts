import { StickerLayerTargetRect } from '~common/sticker/layer/layer-controller';
import { PointerPosition } from '~common/sticker/sticker-store';
import { StickerTargetController } from '~common/sticker/target/target-controller';

export class StickerLayerItem {
	constructor(
		public readonly controller: StickerTargetController,
		public readonly getRect: () => StickerLayerTargetRect,
		public readonly onPlaceDrawerSticker: (pointer: PointerPosition) => void
	) {}
}
