import { defineAsyncComponent } from 'vue';

import { showModal } from '~common/modal/modal.service';
import { UserModel } from '~common/user/user.model';

interface ModalOptions {
	user: UserModel;
}

export async function showInviteModal(options: ModalOptions) {
	return await showModal<void>({
		modalId: 'Invite',
		component: defineAsyncComponent(() => import('~common/invite/modal/AppInviteModal.vue')),
		props: options,
		size: 'sm',
	});
}
