import { asyncComponentLoader } from '../../../../../utils/utils';
import { Modal } from '../../../../../_common/modal/modal.service';
import { ChatRoom } from '../../../../components/chat/room';
import { ChatUserCollection } from '../../../../components/chat/user-collection';

export class FiresideChatMembersModal {
	static async show(chatUsers: ChatUserCollection, chatRoom: ChatRoom) {
		return await Modal.show<void>({
			modalId: 'firesideChatMembers',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "FiresideChatMembersModal" */ './modal.vue')
				),
			props: {
				chatUsers,
				chatRoom,
			},
			size: 'sm',
		});
	}
}
