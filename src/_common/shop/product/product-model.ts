import { assertNever } from '../../../utils/utils';
import { AvatarFrameModel } from '../../avatar/frame.model';
import { BackgroundModel } from '../../background/background.model';
import { StickerPackModel } from '../../sticker/pack/pack.model';
import { StickerModel } from '../../sticker/sticker.model';

/**
 * All the models that can be in the shop.
 */
export type ShopProductModel = AvatarFrameModel | BackgroundModel | StickerPackModel | StickerModel;

export const enum ShopProductResource {
	AvatarFrame = 'Avatar_Frame',
	Background = 'Background',
	StickerPack = 'Sticker_Pack',
	Sticker = 'Sticker',
}

/**
 * Common fields required for shop products. Some of these fields will only be
 * needed in the dashboard for management.
 */
export interface ShopProductCommonFields {
	name: string;
	description: string | undefined;
	is_premium: boolean;
	has_active_sale: boolean;
	was_approved: boolean;
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function getShopProductResource(product: ShopProductModel): ShopProductResource {
	if (product instanceof AvatarFrameModel) {
		return ShopProductResource.AvatarFrame;
	} else if (product instanceof BackgroundModel) {
		return ShopProductResource.Background;
	} else if (product instanceof StickerPackModel) {
		return ShopProductResource.StickerPack;
	} else if (product instanceof StickerModel) {
		return ShopProductResource.Sticker;
	} else {
		return assertNever(product);
	}
}
