import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';

export async function showUserHeaderModal() {
	return await showModal<void>({
		modalId: 'UserHeader',
		component: defineAsyncComponent(() => import('./header-modal.vue')),
		size: 'sm',
		noBackdropClose: true,
	});
}
