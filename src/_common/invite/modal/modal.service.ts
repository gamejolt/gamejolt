import { defineAsyncComponent } from 'vue';
import { showModal } from '../../modal/modal.service';
import { User } from '../../user/user.model';

interface ModalOptions {
	user: User;
}

export class InviteModal {
	static async show(options: ModalOptions) {
		return await showModal<void>({
			modalId: 'Invite',
			component: defineAsyncComponent(() => import('./AppInviteModal.vue')),
			props: options,
			size: 'sm',
		});
	}
}
