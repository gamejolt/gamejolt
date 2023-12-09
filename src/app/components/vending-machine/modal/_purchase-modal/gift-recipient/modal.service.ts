import { defineAsyncComponent } from 'vue';
import { InventoryShopProductSaleModel } from '../../../../../../_common/inventory/shop/inventory-shop-product-sale.model';
import { showModal } from '../../../../../../_common/modal/modal.service';
import { UserModel } from '../../../../../../_common/user/user.model';

export async function showGiftRecipientModal({ sale }: { sale: InventoryShopProductSaleModel }) {
	return await showModal<UserModel>({
		modalId: 'GiftRecipient',
		component: defineAsyncComponent(() => import('./AppGiftRecipientModal.vue')),
		size: 'sm',
		props: {
			sale,
		},
	});
}
