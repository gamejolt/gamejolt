import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';

export async function showClientAntiVirusModal(message: string, title?: string) {
	return await showModal({
		modalId: 'ClientAntiVirus',
		component: defineAsyncComponent(() => import('./anti-virus-modal.vue')),
		props: { message, title },
		size: 'sm',
	});
}
