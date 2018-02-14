import { ChatMessage } from '../message';
import { store } from '../../../store/index';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';

export class ChatNotification {
	private static get chat() {
		return store.state.chat!;
	}

	static notification(message: ChatMessage) {
		if (!this.chat.room || !this.chat.openRooms[message.roomId]) {
			Growls.info({
				title: message.user.displayName,
				message: message.contentRaw, // Use the raw message so we don't show compiled markdown.
				icon: message.user.imgAvatar,
				onclick: () => {
					this.chat.enterRoom(message.roomId, true);
				},
				system: true,
			});
		}
	}
}
