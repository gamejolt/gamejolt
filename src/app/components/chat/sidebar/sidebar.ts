import View from '!view!./sidebar.html';
import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { ChatClient } from '../client';
import { AppChatUserList } from '../user-list/user-list';

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
