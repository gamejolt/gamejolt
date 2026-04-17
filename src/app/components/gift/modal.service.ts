import { defineAsyncComponent, Ref } from 'vue';

import { trackGiftAction } from '~common/analytics/analytics.service';
import { Api } from '~common/api/api.service';
import { showErrorGrowl } from '~common/growls/growls.service';
import { InventoryShopGiftModel } from '~common/inventory/shop/inventory-shop-gift.model';
import { handleProductReceipt } from '~common/inventory/shop/inventory-shop-product-sale.model';
import { InventoryShopProduct } from '~common/inventory/shop/product-owner-helpers';
import { showModal } from '~common/modal/modal.service';
import { UserStickerPackModel } from '~common/sticker/pack/user-pack.model';
import { $gettext } from '~common/translate/translate.service';

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
		component: defineAsyncComponent(
			() => import('~app/components/gift/AppGiftActionModal.vue')
		),
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
