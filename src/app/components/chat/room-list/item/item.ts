import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../../utils/vue';
import { number } from '../../../../../_common/filters/number';
import { Screen } from '../../../../../_common/screen/screen-service';
import { AppScrollInview } from '../../../../../_common/scroll/inview/inview';
import { ChatClient, ChatKey, enterChatRoom } from '../../client';
import { ChatRoom } from '../../room';

@Component({
	components: {
		AppScrollInview,
	},
})
export default class AppChatRoomListItem extends Vue {
	@Prop(propRequired(ChatRoom)) room!: ChatRoom;
	@InjectReactive(ChatKey) chat!: ChatClient;

	isInview = false;

	readonly Screen = Screen;

	get chatNotificationsCount() {
		return number(this.chat.notifications[this.room.id] || 0);
	}

	onRoomClicked(roomId: number) {
		enterChatRoom(this.chat, roomId);
	}
}
