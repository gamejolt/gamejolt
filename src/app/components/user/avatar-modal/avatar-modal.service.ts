import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';

export async function showUserAvatarModal() {
	return await showModal<void>({
		modalId: 'UserAvatar',
		component: defineAsyncComponent(() => import('./UserAvatarModal.vue')),
		size: 'sm',
		noBackdropClose: true,
	});
}
