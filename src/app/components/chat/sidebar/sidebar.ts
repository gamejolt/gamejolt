import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { number } from '../../../../_common/filters/number';
import { Screen } from '../../../../_common/screen/screen-service';
import { ChatClient } from '../client';
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
	@State
	chat!: ChatClient;

	friendsTab: 'all' | 'online' = 'all';

	readonly Screen = Screen;

	get friends() {
		return this.friendsTab === 'online'
			? this.chat.friendsList.collection.filter(i => i.isOnline)
			: this.chat.friendsList.collection;
	}

	get hasPublicRooms() {
		return this.chat.publicRooms && this.chat.publicRooms.length > 0;
	}

	onPublicRoomClicked(roomId: number) {
		this.chat.enterRoom(roomId);
	}
}
