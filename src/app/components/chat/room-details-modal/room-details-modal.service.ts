import { Modal } from 'game-jolt-frontend-lib/components/modal/modal.service';
import { asyncComponentLoader } from 'game-jolt-frontend-lib/utils/utils';
import { ChatRoom } from '../room';

export class ChatRoomDetailsModal {
	static async show(room: ChatRoom) {
		return await Modal.show({
			modalId: 'ChatRoomDetails',
			size: 'sm',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "ChatRoomDetailsModal" */ './room-details-modal.vue')
				),
			props: { room },
		});
	}
}
