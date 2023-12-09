import { Ref, defineAsyncComponent } from 'vue';
import { trackGiftAction } from '../../../_common/analytics/analytics.service';
import { Api } from '../../../_common/api/api.service';
import { showErrorGrowl } from '../../../_common/growls/growls.service';
import { InventoryShopGiftModel } from '../../../_common/inventory/shop/inventory-shop-gift.model';
import { handleProductReceipt } from '../../../_common/inventory/shop/inventory-shop-product-sale.model';
import { InventoryShopProduct } from '../../../_common/inventory/shop/product-owner-helpers';
import { showModal } from '../../../_common/modal/modal.service';
import { UserStickerPackModel } from '../../../_common/sticker/pack/user-pack.model';
import { $gettext } from '../../../_common/translate/translate.service';

export type GiftAction = 'accept' | 'reject' | 'ignore';

export async function showGiftActionModal({
	gift,
	product,
	stickerPacks,
}: {
	gift: InventoryShopGiftModel;
	product: InventoryShopProduct;
	/**
	 * Should be sticker packs from the sticker store. We'll push into this when
	 * we get a new item.
	 */
	stickerPacks: Ref<UserStickerPackModel[]> | undefined;
}) {
	const result = await showModal<GiftAction>({
		modalId: 'GiftAction',
		component: defineAsyncComponent(() => import('./AppGiftActionModal.vue')),
		size: 'sm',
		props: {
			gift,
			product,
		},
	});

	// Modal should be dismissable by clicking outside of it, so we should track
	// any dismissals as "ignore".
	if (!result) {
		trackGiftAction({ action: 'ignore', giftId: gift.id });
		return result;
	}

	try {
		if (result === 'accept') {
			const response = await Api.sendRequest(
				`/web/inventory/gift/accept/${gift.id}`,
				{},
				{ detach: true }
			);

			handleProductReceipt({
				rawProduct: response.product,
				productType: gift.product_type,
				stickerPacks,
			});
		} else if (result === 'reject') {
			await Api.sendRequest(`/web/inventory/gift/decline/${gift.id}`, {}, { detach: true });
		}
	} catch (e) {
		showErrorGrowl($gettext(`Something went wrong. Please try again later.`));
		return undefined;
	}

	return result;
}
