import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';

export async function showPurchaseMicrotransactionModal() {
	return await showModal<void>({
		modalId: 'PurchaseMicrotransaction',
		component: defineAsyncComponent(
			() =>
				import('~common/microtransaction/purchase-modal/AppPurchaseMicrotransactionModal.vue')
		),
		size: 'sm',
	});
}
