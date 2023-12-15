import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../../../_common/modal/modal.service';
import { UserModel } from '../../../../../../_common/user/user.model';

export async function showPurchaseShopProductConfirmModal({ giftUser }: { giftUser: UserModel }) {
	return await showModal<boolean>({
		modalId: 'PurchaseShopProductConfirm',
		component: defineAsyncComponent(() => import('./AppPurchaseShopProductConfirmModal.vue')),
		size: 'sm',
		props: {
			giftUser,
		},
	});
}
