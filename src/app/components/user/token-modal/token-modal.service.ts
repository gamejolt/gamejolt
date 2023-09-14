import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';

export async function showUserTokenModal() {
	return await showModal<void>({
		modalId: 'UserToken',
		component: defineAsyncComponent(() => import('./token-modal.vue')),
		size: 'sm',
		props: {},
	});
}
