import Vue from 'vue';
import { Component, InjectReactive } from 'vue-property-decorator';
import { number } from '../../../../_common/filters/number';
import { Screen } from '../../../../_common/screen/screen-service';
import { ChatClient, ChatKey, enterChatRoom } from '../client';
import AppChatUserList from '../user-list/user-list.vue';

@Component({
	components: {
		AppChatUserList,
	},
	filters: {
		number,
	},
})
export default class AppChatSidebar extends Vue {
	@InjectReactive(ChatKey) chat!: ChatClient;

	friendsTab: 'all' | 'online' = 'all';

	readonly Screen = Screen;

	get friends() {
		return this.friendsTab === 'online'
			? this.chat.friendsList.collection.filter(i => i.isOnline)
			: this.chat.friendsList.collection;
	}

	onPublicRoomClicked(roomId: number) {
		enterChatRoom(this.chat, roomId);
	}
}
