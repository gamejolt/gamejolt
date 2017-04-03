import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import * as View from '!view!./window.html?style=./window.styl';

import { makeObservableService } from '../../../../lib/gj-lib-client/utils/vue';
import { Chat } from '../chat.service';
import { ChatRoom } from '../room';
import { ChatMessage } from '../message';
import { ChatUserCollection } from '../user-collection';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppChatUserList } from '../user-list/user-list';
import { number } from '../../../../lib/gj-lib-client/vue/filters/number';
import { AppChatWindowSend } from './send/send';
import { AppChatWindowOutput } from './output/output';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppFadeCollapse } from '../../../../lib/gj-lib-client/components/fade-collapse/fade-collapse';

@View
@Component({
	components: {
		AppJolticon,
		AppChatUserList,
		AppChatWindowSend,
		AppChatWindowOutput,
		AppFadeCollapse,
	},
	filters: {
		number,
	},
})
export class AppChatWindow extends Vue
{
	@Prop( Object ) room: ChatRoom;
	@Prop( Array ) messages: ChatMessage[];
	@Prop( Object ) users?: ChatUserCollection;

	isShowingUsers = false;
	showModTools = false;

	client = Chat.client;
	ChatRoom = ChatRoom;
	Screen = makeObservableService( Screen );

	minimize()
	{
		this.client.minimizeRoom();
	}

	close()
	{
		this.client.leaveRoom( this.room.id );
	}

	// $scope.$watch( 'ctrl.room.isMod', function( isMod, prev )
	// {
	// 	if ( !Chat.client.currentUser || !Chat.client.isGroupRoom( _this.room ) ) {
	// 		_this.showModTools = false;
	// 		return;
	// 	}

	// 	if ( !!isMod || Chat.client.currentUser.permissionLevel >= ChatConfig.SITE_MOD_PERMISSION ) {
	// 		_this.showModTools = true;
	// 	}
	// 	else {
	// 		_this.showModTools = false;
	// 	}

	// 	// Only if things have changed! Perf improvement.
	// 	if ( isMod !== prev ) {

	// 		// We gotta refresh the whole user list now so the mod tools get changed. Yikes!
	// 		Chat.client.usersOnline[ _this.room.id ].touchAll();
	// 	}
	// } );

	// Closes chat completely.
	// When you click on the empty space behind the chat, we want to close the chat just
	// like you would when clicking the normal backdrop.
	closeChat()
	{
		// Shell.toggleRightPane();
	}

	showEditRoomModal()
	{
		// Chat_SaveRoomModal.show( this.room );
	}

	viewRoomDetails()
	{
		// Chat_RoomDetailsModal.show( this.room );
	}

	toggleUsers()
	{
		this.isShowingUsers = !this.isShowingUsers;
	}
}
