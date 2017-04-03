import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./sidebar.html?style=./sidebar.styl';

import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { Chat } from '../chat.service';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppChatUserList } from '../user-list/user-list';

@View
@Component({
	components: {
		AppJolticon,
		AppChatUserList,
	},
	filters: {
		number,
	}
})
export class AppChatSidebar extends Vue
{
	Screen = makeObservableService( Screen );
	Chat = makeObservableService( Chat );
	client = Chat.client;

	shouldShowOfflineFriends = false;

	get onlineFriends()
	{
		return this.client.friendsList.collection.filter( ( item ) =>
			item.isOnline || this.client.notifications[ item.roomId ] );
	}

	get offlineFriends()
	{
		return this.client.friendsList.collection.filter( ( item ) => !item.isOnline );
	}

	onPublicRoomClicked( roomId: number )
	{
		this.client.enterRoom( roomId, true );
	}
}
