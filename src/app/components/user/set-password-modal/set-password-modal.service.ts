import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';

export async function showUserSetPasswordModal() {
	return await showModal<boolean>({
		modalId: 'UserSetPassword',
		component: defineAsyncComponent(
			() => import('~app/components/user/set-password-modal/AppUserSetPasswordModal.vue')
		),
		size: 'sm',
		props: {},
	});
}
