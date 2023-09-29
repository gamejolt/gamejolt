import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';

export async function showVendingMachineModal(options: { userId?: number } = {}) {
	const { userId } = options;

	return await showModal<void>({
		modalId: 'VendingMachine',
		component: defineAsyncComponent(() => import('./AppVendingMachineModal.vue')),
		size: 'lg',
		props: {
			userId,
		},
	});
}
