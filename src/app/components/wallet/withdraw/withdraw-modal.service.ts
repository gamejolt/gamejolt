import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';

export async function showWalletWithdrawModal() {
	return await showModal({
		modalId: 'WalletWithdraw',
		component: defineAsyncComponent(() => import('./AppWalletWithdrawModal.vue')),
		props: {},
		size: 'sm',
	});
}
