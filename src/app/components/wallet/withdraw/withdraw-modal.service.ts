import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';

export async function showWalletWithdrawModal() {
	return await showModal({
		modalId: 'WalletWithdraw',
		component: defineAsyncComponent(
			() => import('~app/components/wallet/withdraw/AppWalletWithdrawModal.vue')
		),
		props: {},
		size: 'sm',
	});
}
