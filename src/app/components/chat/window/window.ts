import Vue from 'vue';
import { State, Action } from 'vuex-class';
import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./window.html?style=./window.styl';

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
import { ChatClient } from '../client';
import { Store } from '../../../store/index';
import { AppScrollInviewParent } from '../../../../lib/gj-lib-client/components/scroll/inview/parent';

@View
@Component({
	components: {
		AppJolticon,
		AppScrollInviewParent,
		AppChatUserList,
		AppChatWindowSend,
		AppChatWindowOutput,
		AppFadeCollapse,
	},
	filters: {
		number,
	},
})
export class AppChatWindow extends Vue {
	@Prop(ChatRoom) room: ChatRoom;
	@Prop(Array) messages: ChatMessage[];
	@Prop(ChatUserCollection) users?: ChatUserCollection;

	@State chat: ChatClient;

	@Action toggleRightPane: Store['toggleRightPane'];

	isShowingUsers = false;
	isDescriptionCollapsed = false;

	readonly ChatRoom = ChatRoom;
	readonly Screen = Screen;

	close() {
		// xs size needs to show the friends list when closing the room.
		// any other size can close the whole chat instead
		if (Screen.isXs) {
			this.chat.leaveRoom();
		} else {
			this.chat.closeChat();
		}
	}

	// Closes chat completely. When you click on the empty space behind the
	// chat, we want to close the chat just like you would when clicking the
	// normal backdrop.
	closeChat() {
		this.toggleRightPane();
	}

	showEditRoomModal() {
		// Chat_SaveRoomModal.show( this.room );
	}

	toggleUsers() {
		this.isShowingUsers = !this.isShowingUsers;
	}
}
