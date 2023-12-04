import { defineAsyncComponent } from 'vue';
import { showModal } from '../modal/modal.service';

export async function showAuthModal() {
	return await showModal<void>({
		modalId: 'Auth',
		component: defineAsyncComponent(() => import('./AppAuthModal.vue')),
		size: 'sm',
		props: {},
		noBackdropClose: true,
	});
}
