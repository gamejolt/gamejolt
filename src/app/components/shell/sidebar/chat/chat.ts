import Vue from 'vue';
import { Component, InjectReactive } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { EscapeStack } from '../../../../../_common/escape-stack/escape-stack.service';
import { number } from '../../../../../_common/filters/number';
import { Screen } from '../../../../../_common/screen/screen-service';
import { Store } from '../../../../store';
import { ChatClient, ChatKey, enterChatRoom, leaveChatRoom } from '../../../chat/client';
import AppChatUserList from '../../../chat/user-list/user-list.vue';
import AppChatWindows from '../../../chat/windows/windows.vue';

@Component({
	components: {
		AppChatUserList,
		AppChatWindows,
	},
})
export default class AppShellSidebarChat extends Vue {
	@InjectReactive(ChatKey) chat!: ChatClient;

	@State visibleLeftPane!: Store['visibleLeftPane'];
	@Action toggleLeftPane!: Store['toggleLeftPane'];

	tab: 'chats' | 'friends' = 'chats';

	private escapeCallback?: () => void;

	readonly Screen = Screen;

	get friends() {
		return this.chat.friendsList.collection;
	}

	get groups() {
		return this.chat.groupRooms;
	}
	get chats() {
		return [...this.groups, ...this.friends];
	}

	get hasGroupRooms() {
		return this.groups.length > 0;
	}

	get friendsCount() {
		return number(this.chat.friendsList.collection.length);
	}

	mounted() {
		// xs size needs to show the friends list
		if (this.chat.sessionRoomId && !Screen.isXs) {
			enterChatRoom(this.chat, this.chat.sessionRoomId);
		}

		this.escapeCallback = () => this.hideChatPane();
		EscapeStack.register(this.escapeCallback);
	}

	destroyed() {
		if (this.escapeCallback) {
			EscapeStack.deregister(this.escapeCallback);
			this.escapeCallback = undefined;
		}

		leaveChatRoom(this.chat);
	}

	hideChatPane() {
		if (this.visibleLeftPane === 'chat') {
			this.toggleLeftPane('chat');
		}
	}
}
