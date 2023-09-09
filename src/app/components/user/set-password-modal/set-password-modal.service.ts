import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';

export async function showUserSetPasswordModal() {
	return await showModal<boolean>({
		modalId: 'UserSetPassword',
		component: defineAsyncComponent(() => import('./set-password-modal.vue')),
		size: 'sm',
		props: {},
	});
}
