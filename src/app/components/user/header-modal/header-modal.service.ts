import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';

export async function showUserHeaderModal() {
	return await showModal<void>({
		modalId: 'UserHeader',
		component: defineAsyncComponent(() => import('~app/components/user/header-modal/AppUserHeaderModal.vue')),
		size: 'sm',
		noBackdropClose: true,
	});
}
