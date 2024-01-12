import { defineAsyncComponent } from 'vue';
import { showModal } from '../modal/modal.service';

export async function showGetAppModal() {
	return await showModal<void>({
		modalId: 'GetApp',
		component: defineAsyncComponent(() => import('./AppGetAppModal.vue')),
		size: 'sm',
	});
}
