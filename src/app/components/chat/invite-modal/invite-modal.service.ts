import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';

export class ChatInviteModal {
	static async show(room: ChatRoom, friends: ChatUser[], initialUser?: ChatUser) {
		return await showModal({
			modalId: 'ChatInvite',
			size: 'sm',
			component: defineAsyncComponent(() => import('./invite-modal.vue')),
			props: { room, friends, initialUser },
		});
	}
}
