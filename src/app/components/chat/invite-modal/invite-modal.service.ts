import { defineAsyncComponent } from 'vue';
import { Modal } from '../../../../_common/modal/modal.service';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';

export class ChatInviteModal {
	static async show(room: ChatRoom, friends: ChatUser[], initialUser?: ChatUser) {
		return await Modal.show({
			modalId: 'ChatInvite',
			size: 'sm',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "ChatInviteModal" */ './invite-modal.vue')
			),
			props: { room, friends, initialUser },
		});
	}
}
