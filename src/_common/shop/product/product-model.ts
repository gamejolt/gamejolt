import { AvatarFrameModel } from '~common/avatar/frame.model';
import { BackgroundModel } from '~common/background/background.model';
import { StickerPackModel } from '~common/sticker/pack/pack.model';
import { StickerModel } from '~common/sticker/sticker.model';
import { assertNever } from '~utils/utils';

/**
 * All the models that can be in the shop.
 */
export type ShopProductModel = AvatarFrameModel | BackgroundModel | StickerPackModel | StickerModel;

export const ShopProductResourceAvatarFrame = 'Avatar_Frame';
export const ShopProductResourceBackground = 'Background';
export const ShopProductResourceStickerPack = 'Sticker_Pack';
export const ShopProductResourceSticker = 'Sticker';

export type ShopProductResource =
	| typeof ShopProductResourceAvatarFrame
	| typeof ShopProductResourceBackground
	| typeof ShopProductResourceStickerPack
	| typeof ShopProductResourceSticker;

/**
 * Common fields required for shop products. Some of these fields will only be
 * needed in the dashboard for management.
 */
export interface ShopProductCommonFields {
	name: string;
	description: string | undefined;
	is_premium: boolean;
	is_animated: boolean;
	has_active_sale: boolean;
	was_approved: boolean;
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function getShopProductResource(product: ShopProductModel): ShopProductResource {
	if (product instanceof AvatarFrameModel) {
		return ShopProductResourceAvatarFrame;
	} else if (product instanceof BackgroundModel) {
		return ShopProductResourceBackground;
	} else if (product instanceof StickerPackModel) {
		return ShopProductResourceStickerPack;
	} else if (product instanceof StickerModel) {
		return ShopProductResourceSticker;
	} else {
		return assertNever(product);
	}
}
