import { Growls } from '../../../../_common/growls/growls.service';
import { ChatClient, enterChatRoom, isInChatRoom } from '../client';
import { ChatMessage } from '../message';
import AppChatNotificationGrowl from './notification-growl.vue';

export class ChatNotificationGrowl {
	static async show(chat: ChatClient, message: ChatMessage) {
		// Skip if already in the room.
		if (isInChatRoom(chat, message.room_id)) {
			return;
		}

		Growls.info({
			onclick: () => enterChatRoom(chat, message.room_id),
			system: true,

			component: AppChatNotificationGrowl,
			props: { chat, message },
		});
	}
}
