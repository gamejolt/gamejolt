import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';
import { UserModel } from '~common/user/user.model';

export async function showPurchaseShopProductConfirmModal({ giftUser }: { giftUser: UserModel }) {
	return await showModal<boolean>({
		modalId: 'PurchaseShopProductConfirm',
		component: defineAsyncComponent(
			() =>
				import('~common/inventory/shop/purchase-modal/confirm/AppPurchaseShopProductConfirmModal.vue')
		),
		size: 'sm',
		props: {
			giftUser,
		},
	});
}
