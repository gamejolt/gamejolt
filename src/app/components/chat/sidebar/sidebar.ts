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

	friendsTab: 'all' | 'online' = 'all';

	readonly Screen = Screen;

	get friends() {
		return this.friendsTab === 'online'
			? this.chat.friendsList.collection.filter(i => i.isOnline)
			: this.chat.friendsList.collection;
	}

	onPublicRoomClicked(roomId: number) {
		this.chat.enterRoom(roomId);
	}
}
