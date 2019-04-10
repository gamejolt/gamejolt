import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { ChatClient } from '../client';
import AppChatUserList from '../user-list/user-list.vue';

@Component({
	components: {
		AppJolticon,
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
