import Vue from 'vue';
import { State } from 'vuex-class';
import { Component } from 'vue-property-decorator';
import View from '!view!./sidebar.html?style=./sidebar.styl';

import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppChatUserList } from '../user-list/user-list';
import { ChatClient } from '../client';

@View
@Component({
	components: {
		AppJolticon,
		AppChatUserList,
	},
	filters: {
		number,
	},
})
export class AppChatSidebar extends Vue {
	@State chat: ChatClient;

	readonly Screen = Screen;

	showFriends = false;

	mounted() {
		this.showFriends = this.shouldAlwaysShowFriends;
	}

	get shouldAlwaysShowFriends() {
		return !this.Screen.isXs || this.chat.friendsList.collection.length <= 50;
	}

	get shouldShowFriends() {
		return this.shouldAlwaysShowFriends || this.showFriends;
	}

	get friends() {
		return this.chat.friendsList.collection;
	}

	changeFriendListVisibility() {
		if (!this.shouldAlwaysShowFriends) {
			this.showFriends = !this.showFriends;
		}
	}

	onPublicRoomClicked(roomId: number) {
		this.chat.enterRoom(roomId);
	}
}
