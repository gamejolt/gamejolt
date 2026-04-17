import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';

export async function showAuthModal() {
	return await showModal<void>({
		modalId: 'Auth',
		component: defineAsyncComponent(() => import('~common/auth/AppAuthModal.vue')),
		size: 'sm',
		props: {},
		noBackdropClose: true,
	});
}
