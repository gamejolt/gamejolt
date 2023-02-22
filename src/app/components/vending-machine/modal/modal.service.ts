import { computed, defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';
import { Screen } from '../../../../_common/screen/screen-service';

export async function showVendingMachineModal() {
	return await showModal<void>({
		modalId: 'VendingMachine',
		component: defineAsyncComponent(() => import('./AppVendingMachineModal.vue')),
		props: {},
		size: computed(() => (Screen.height < 1080 ? 'sm' : 'lg')),
	});
}
