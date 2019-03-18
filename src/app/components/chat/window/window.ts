import AppFadeCollapse from 'game-jolt-frontend-lib/components/fade-collapse/fade-collapse.vue';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import { AppScrollInviewParent } from 'game-jolt-frontend-lib/components/scroll/inview/parent';
import AppJolticon from 'game-jolt-frontend-lib/vue/components/jolticon/jolticon.vue';
import { number } from 'game-jolt-frontend-lib/vue/filters/number';
import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
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
