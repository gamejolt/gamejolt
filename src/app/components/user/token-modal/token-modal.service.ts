import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';

export async function showUserTokenModal() {
	return await showModal<void>({
		modalId: 'UserToken',
		component: defineAsyncComponent(
			() => import('~app/components/user/token-modal/AppUserTokenModal.vue')
		),
		size: 'sm',
		props: {},
	});
}
