import { defineAsyncComponent } from 'vue';
import { AvatarFrameModel } from '../../../../../_common/avatar/frame.model';
import { BackgroundModel } from '../../../../../_common/background/background.model';
import { CollectibleModel } from '../../../../../_common/collectible/collectible.model';
import { InventoryShopProductSaleModel } from '../../../../../_common/inventory/shop/inventory-shop-product-sale.model';
import { showModal } from '../../../../../_common/modal/modal.service';
import { StickerPackModel } from '../../../../../_common/sticker/pack/pack.model';

const PurchasableProductType = ['Avatar_Frame', 'Background', 'Sticker_Pack'] as const;

export type PurchasableProduct =
	| { resource: (typeof PurchasableProductType)[number]; resourceId: number }
	| InventoryShopProductSaleModel
	| CollectibleModel
	| AvatarFrameModel
	| BackgroundModel
	| StickerPackModel;

/**
 * Shows a modal that allows the user to purchase a product or gives some info
 * on how to obtain it.
 *
 * @param product supports either the direct Model we want to purchase, or a
 * resource/resourceId pair that will be used to fetch the model.
 *
 * NOTE: Does not support {@link CollectibleModel} with a type of `Sticker`.
 */
export async function showPurchaseShopProductModal({
	product,
	onItemPurchased,
}: {
	product: PurchasableProduct;
	onItemPurchased?(): void;
}) {
	return await showModal<void>({
		modalId: 'PurchaseShopProduct',
		component: defineAsyncComponent(() => import('./AppPurchaseShopProductModal.vue')),
		props: {
			initialProduct: product,
			onItemPurchased,
		},
		size: 'sm',
	});
}
