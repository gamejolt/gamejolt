import { defineAsyncComponent } from 'vue';

import { InventoryShopProductSaleModel } from '~common/inventory/shop/inventory-shop-product-sale.model';
import { showModal } from '~common/modal/modal.service';
import { UserModel } from '~common/user/user.model';

export async function showGiftRecipientModal({ sale }: { sale: InventoryShopProductSaleModel }) {
	return await showModal<UserModel>({
		modalId: 'GiftRecipient',
		component: defineAsyncComponent(
			() =>
				import('~app/components/vending-machine/modal/_purchase-modal/gift-recipient/AppGiftRecipientModal.vue')
		),
		size: 'sm',
		props: {
			sale,
		},
	});
}
