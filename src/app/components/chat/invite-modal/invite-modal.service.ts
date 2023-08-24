import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';
import { ChatRoomModel } from '../room';
import { ChatUser } from '../user';

export class ChatInviteModal {
	static async show(room: ChatRoomModel, friends: ChatUser[], initialUser?: ChatUser) {
		return await showModal<boolean | undefined>({
			modalId: 'ChatInvite',
			size: 'sm',
			component: defineAsyncComponent(() => import('./invite-modal.vue')),
			props: { room, friends, initialUser },
		});
	}
}
