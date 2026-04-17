import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';

export async function showUserAvatarModal() {
	return await showModal<void>({
		modalId: 'UserAvatar',
		component: defineAsyncComponent(
			() => import('~app/components/user/avatar-modal/UserAvatarModal.vue')
		),
		size: 'sm',
		noBackdropClose: true,
	});
}
