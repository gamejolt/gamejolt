import { Growls } from '../../../../_common/growls/growls.service';
import { store } from '../../../store/index';
import { ChatMessage } from '../message';

export class ChatNotification {
	private static get chat() {
		return store.state.chat!;
	}

	static notification(message: ChatMessage) {
		// Skip if already in the room.
		if (this.chat.isInRoom(message.roomId)) {
			return;
		}

		Growls.info({
			title: message.user.displayName,
			message: message.content, // Use the raw message so we don't show compiled markdown.
			icon: message.user.imgAvatar,
			onclick: () => {
				this.chat.enterRoom(message.roomId);
			},
			system: true,
		});
	}
}
