import { defineAsyncComponent } from 'vue';
import { showModal } from '../../modal/modal.service';

export async function showPurchaseMicrotransactionModal() {
	return await showModal<void>({
		modalId: 'PurchaseMicrotransaction',
		component: defineAsyncComponent(() => import('./AppPurchaseMicrotransactionModal.vue')),
		size: 'sm',
	});
}
