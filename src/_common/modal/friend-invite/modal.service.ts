import { defineAsyncComponent } from 'vue';
import { User } from '../../user/user.model';
import { showModal } from '../modal.service';

interface LikersModalOptions {
	user: User;
}

export class InviteFriendModal {
	static async show(options: LikersModalOptions) {
		return await showModal<void>({
			modalId: 'InviteFriend',
			component: defineAsyncComponent(() => import('./AppInviteFriendModal.vue')),
			props: options,
			size: 'sm',
		});
	}
}
