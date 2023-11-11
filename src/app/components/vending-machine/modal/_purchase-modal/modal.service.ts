import { defineAsyncComponent } from 'vue';
import {
	AvatarFrameModel,
	DefaultAvatarFrameScale,
} from '../../../../../_common/avatar/frame.model';
import {
	BackgroundModel,
	getBackgroundImgUrl,
} from '../../../../../_common/background/background.model';
import { CollectibleModel } from '../../../../../_common/collectible/collectible.model';
import { InventoryShopProductSaleModel } from '../../../../../_common/inventory/shop/inventory-shop-product-sale.model';
import { showModal } from '../../../../../_common/modal/modal.service';
import { StickerPackModel } from '../../../../../_common/sticker/pack/pack.model';
import { isInstance } from '../../../../../utils/utils';

type ShopProductDisplay =
	| InventoryShopProductSaleModel
	| CollectibleModel
	| AvatarFrameModel
	| BackgroundModel
	| StickerPackModel;

interface BaseOptions {
	product: ShopProductDisplay;
	onItemPurchased?(): void;
}

interface BasePurchaseData {
	type: string;
	id: number;
	name: string;
	imgUrl: string;
	processMediaserverUrl?: boolean;
}
interface AvatarFramePurchaseData extends BasePurchaseData {
	type: 'Avatar_Frame';
	scale?: number;
}
interface BackgroundPurchaseData extends BasePurchaseData {
	type: 'Background';
}
interface StickerPackPurchaseData extends BasePurchaseData {
	type: 'Sticker_Pack';
}

export type ProductPurchaseData =
	| AvatarFramePurchaseData
	| BackgroundPurchaseData
	| StickerPackPurchaseData;

// TODO(collectible-sales) add resource/resourceId fetching instead of requiring full product data.
export function getShopProductDisplayData(data: ShopProductDisplay): ProductPurchaseData {
	if (isInstance(data, CollectibleModel)) {
		const id = parseInt(data.id.split(':').reverse()[0], 10);
		const type = data.type;
		if (type === 'Avatar_Frame') {
			return {
				type,
				id,
				imgUrl: data.image_url,
				name: data.name,
				scale: DefaultAvatarFrameScale,
			};
		} else if (type === 'Background') {
			return {
				type,
				id,
				imgUrl: data.image_url,
				name: data.name,
			};
		}
		throw new Error('Unsupported collectible type.');
	}

	let avatarFrame = isInstance(data, AvatarFrameModel) ? data : null;
	let background = isInstance(data, BackgroundModel) ? data : null;
	let stickerPack = isInstance(data, StickerPackModel) ? data : null;

	if (isInstance(data, InventoryShopProductSaleModel)) {
		if (data.avatarFrame) {
			avatarFrame = data.avatarFrame;
		} else if (data.background) {
			background = data.background;
		} else if (data.stickerPack) {
			stickerPack = data.stickerPack;
		}
	}

	if (avatarFrame) {
		return {
			type: 'Avatar_Frame',
			id: avatarFrame.id,
			name: avatarFrame.name,
			scale: avatarFrame.scale,
			imgUrl: avatarFrame.image_url,
		};
	} else if (background) {
		return {
			type: 'Background',
			id: background.id,
			name: background.name,
			imgUrl: getBackgroundImgUrl(background),
		};
	} else if (stickerPack) {
		const media = stickerPack.media_item;
		const mediaserverUrl = media.is_animated ? null : media.mediaserver_url;
		return {
			type: 'Sticker_Pack',
			id: stickerPack.id,
			name: stickerPack.name,
			imgUrl: mediaserverUrl ?? media.img_url,
			processMediaserverUrl: !!mediaserverUrl,
		};
	}
	throw new Error('Invalid shop product data.');
}

export async function showPurchaseShopProductModal({ product, onItemPurchased }: BaseOptions) {
	const productData = getShopProductDisplayData(product);

	return await showModal<void>({
		modalId: 'PurchaseShopProduct',
		component: defineAsyncComponent(() => import('./AppPurchaseShopProductModal.vue')),
		props: {
			productData,
			onItemPurchased,
		},
		size: 'sm',
	});
}
