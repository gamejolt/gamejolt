import { defineAsyncComponent } from 'vue';
import { showModal } from '../../modal/modal.service';
import { UserModel } from '../../user/user.model';

interface ModalOptions {
	user: UserModel;
}

export async function showInviteModal(options: ModalOptions) {
	return await showModal<void>({
		modalId: 'Invite',
		component: defineAsyncComponent(() => import('./AppInviteModal.vue')),
		props: options,
		size: 'sm',
	});
}
