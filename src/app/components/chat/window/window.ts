import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import AppFadeCollapse from '../../../../_common/fade-collapse/fade-collapse.vue';
import { number } from '../../../../_common/filters/number';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import { Store } from '../../../store/index';
import { ChatClient } from '../client';
import { ChatMessage } from '../message';
import { ChatRoom } from '../room';
import { ChatUserCollection } from '../user-collection';
import AppChatUserList from '../user-list/user-list.vue';
import AppChatWindowOutput from './output/output.vue';
import AppChatWindowSend from './send/send.vue';

@Component({
	components: {
		AppScrollScroller,
		AppChatUserList,
		AppChatWindowSend,
		AppChatWindowOutput,
		AppFadeCollapse,
	},
	filters: {
		number,
	},
})
export default class AppChatWindow extends Vue {
	@Prop(ChatRoom) room!: ChatRoom;
	@Prop(Array) messages!: ChatMessage[];
	@Prop(ChatUserCollection) users?: ChatUserCollection;

	@State chat!: ChatClient;

	@Action toggleRightPane!: Store['toggleRightPane'];

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
