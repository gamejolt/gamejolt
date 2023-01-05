import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';

export async function showVendingMachineModal() {
	return await showModal<void>({
		modalId: 'VendingMachine',
		component: defineAsyncComponent(() => import('./AppVendingMachineModal.vue')),
		props: {},
		size: 'sm',
	});
}
