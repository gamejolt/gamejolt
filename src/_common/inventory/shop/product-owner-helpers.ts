import { AvatarFrameModel } from '../../avatar/frame.model';
import { BackgroundModel, getBackgroundImgUrl } from '../../background/background.model';
import { getModel, storeModel } from '../../model/model-store.service';
import { StickerPackRatio } from '../../sticker/pack/AppStickerPack.vue';
import { StickerPackModel } from '../../sticker/pack/pack.model';

export type InventoryShopProduct = StickerPackModel | AvatarFrameModel | BackgroundModel;

export const enum PurchasableProductType {
	StickerPack = 'Sticker_Pack',
	AvatarFrame = 'Avatar_Frame',
	Background = 'Background',
}

export type PurchasableProductData = {
	resource: PurchasableProductType;
	resourceId: number;
};

interface BaseProductData {
	resource: PurchasableProductData['resource'];
	resourceId: PurchasableProductData['resourceId'];
	name: string | undefined;
	imgUrl: string | undefined;
	processMediaserverUrl?: boolean;
	aspectRatio: number;
}

interface AvatarFrameProductData extends BaseProductData {
	resource: PurchasableProductType.AvatarFrame;
	scale?: number;
}

interface BackgroundProductData extends BaseProductData {
	resource: PurchasableProductType.Background;
}

interface StickerPackProductData extends BaseProductData {
	resource: PurchasableProductType.StickerPack;
}

export type NormalizedProductData =
	| AvatarFrameProductData
	| BackgroundProductData
	| StickerPackProductData;

/**
 * NOTE: Might have side effects.
 */
export function getShopProductDisplayData({
	resource,
	resourceId,
}: PurchasableProductData): NormalizedProductData {
	let avatarFrame: AvatarFrameModel | null = null;
	let background: BackgroundModel | null = null;
	let stickerPack: StickerPackModel | null = null;

	let aspectRatio = 1;

	// Check the model store for existing data we can use.
	if (resource === 'Avatar_Frame') {
		avatarFrame = getModel(AvatarFrameModel, resourceId) || null;
	} else if (resource === 'Background') {
		background = getModel(BackgroundModel, resourceId) || null;
	} else if (resource === 'Sticker_Pack') {
		stickerPack = getModel(StickerPackModel, resourceId) || null;
		aspectRatio = StickerPackRatio;
	}

	if (avatarFrame) {
		return {
			resource: PurchasableProductType.AvatarFrame,
			resourceId: avatarFrame.id,
			name: avatarFrame.name,
			scale: avatarFrame.scale,
			imgUrl: avatarFrame.image_url,
			aspectRatio,
		};
	} else if (background) {
		return {
			resource: PurchasableProductType.Background,
			resourceId: background.id,
			name: background.name,
			imgUrl: getBackgroundImgUrl(background),
			aspectRatio,
		};
	} else if (stickerPack) {
		const media = stickerPack.media_item;
		const mediaserverUrl = media.is_animated ? null : media.mediaserver_url;
		return {
			resource: PurchasableProductType.StickerPack,
			resourceId: stickerPack.id,
			name: stickerPack.name,
			imgUrl: mediaserverUrl ?? media.img_url,
			processMediaserverUrl: !!mediaserverUrl,
			aspectRatio,
		};
	}

	// If we haven't loaded in these models yet, return the resource/resourceId
	// pair so we can fetch it.
	return {
		resourceId,
		resource,
		name: undefined,
		imgUrl: undefined,
		aspectRatio,
	};
}

/**
 * Creates the product based on the product type backend provides.
 *
 * NOTE: This has side effects.
 */
export function assignShopProductOwnerData(
	model: {
		product_type: PurchasableProductType;
		product?: InventoryShopProduct;
	},
	data: any
) {
	if (!data || !data.product) {
		return;
	}
	switch (model.product_type) {
		case PurchasableProductType.StickerPack:
			model.product = storeModel(StickerPackModel, data.product);
			break;

		case PurchasableProductType.AvatarFrame:
			model.product = storeModel(AvatarFrameModel, data.product);
			break;

		case PurchasableProductType.Background:
			model.product = storeModel(BackgroundModel, data.product);
			break;

		default:
			console.warn('Unsupported product type', model.product_type);
			model.product = undefined;
			break;
	}
}

/**
 * @__NO_SIDE_EFFECTS__
 */
export function getReadablePurchasableProductType(type: PurchasableProductType) {
	switch (type) {
		case PurchasableProductType.StickerPack:
			return 'Sticker pack';

		case PurchasableProductType.AvatarFrame:
			return 'Avatar frame';

		case PurchasableProductType.Background:
			return 'Background';
	}
}
