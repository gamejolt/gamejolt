import { defineAsyncComponent } from 'vue';
import { showModal } from '../../../../_common/modal/modal.service';
import { ChatRoom } from '../room';

export class ChatRoomDetailsModal {
	static async show(room: ChatRoom) {
		return await showModal({
			modalId: 'ChatRoomDetails',
			size: 'sm',
			component: defineAsyncComponent(
				() =>
					import(
						/* webpackChunkName: "ChatRoomDetailsModal" */ './room-details-modal.vue'
					)
			),
			props: { room },
		});
	}
}
