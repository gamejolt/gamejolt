import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { asyncComponentLoader } from 'game-jolt-frontend-lib/utils/utils';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';

export class ChatModerateUserModal {
	static async show(room: ChatRoom, user: ChatUser) {
		return await Modal.show<void>({
			modalId: 'ChatModerateUser',
			size: 'sm',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "ChatModerateUserModal" */ './moderate-user-modal.vue')
				),
			props: { room, user },
		});
	}
}
