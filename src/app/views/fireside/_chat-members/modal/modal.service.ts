import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../../_common/modal/modal.service';
import { ChatRoom } from '../../../../components/chat/room';
import { ChatUserCollection } from '../../../../components/chat/user-collection';

export class FiresideChatMembersModal {
	static async show(chatUsers: ChatUserCollection, chatRoom: ChatRoom) {
		return await showModal<void>({
			modalId: 'firesideChatMembers',
			component: defineAsyncComponent(
				() => import(/* webpackChunkName: "FiresideChatMembersModal" */ './modal.vue')
			),
			props: {
				chatUsers,
				chatRoom,
			},
			size: 'sm',
		});
	}
}
