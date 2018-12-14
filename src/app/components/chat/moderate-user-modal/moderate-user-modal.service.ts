import { Modal } from '../../../../lib/gj-lib-client/components/modal/modal.service';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';
import { ChatRoom } from '../room';
import { ChatUser } from '../user';

export class ChatModerateUserModal {
	static async show(room: ChatRoom, user: ChatUser) {
		return await Modal.show<void>({
			modalId: 'ChatModerateUser',
			size: 'sm',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "ChatModerateUserModal" */ './moderate-user-modal')
				),
			props: { room, user },
		});
	}
}
