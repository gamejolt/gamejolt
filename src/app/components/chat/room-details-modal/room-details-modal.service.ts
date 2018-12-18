import { Modal } from '../../../../lib/gj-lib-client/components/modal/modal.service';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';
import { ChatRoom } from '../room';

export class ChatRoomDetailsModal {
	static async show(room: ChatRoom) {
		return await Modal.show({
			modalId: 'ChatRoomDetails',
			size: 'sm',
			component: () =>
				asyncComponentLoader(
					import(/* webpackChunkName: "ChatRoomDetailsModal" */ './room-details-modal')
				),
			props: { room },
		});
	}
}
