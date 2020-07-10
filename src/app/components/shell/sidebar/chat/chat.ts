import Vue from 'vue';
import { Component, InjectReactive, Watch } from 'vue-property-decorator';
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
	filters: {
		number,
	},
})
export default class AppShellSidebarChat extends Vue {
	// Chat should be available since we only include in DOM if chat is
	// bootstrapped.
	@InjectReactive(ChatKey) chat!: ChatClient;

	@State visibleLeftPane!: Store['visibleLeftPane'];
	@Action toggleLeftPane!: Store['toggleLeftPane'];

	friendsTab: 'all' | 'online' = 'all';
	private escapeCallback?: Function;

	readonly Screen = Screen;

	get friends() {
		return this.friendsTab === 'online'
			? this.chat.friendsList.collection.filter(i => i.isOnline)
			: this.chat.friendsList.collection;
	}

	onPublicRoomClicked(roomId: number) {
		enterChatRoom(this.chat, roomId);
	}

	mounted() {
		this.escapeCallback = () => this.hideChatPane();
		EscapeStack.register(this.escapeCallback);
	}

	destroyed() {
		if (this.escapeCallback) {
			EscapeStack.deregister(this.escapeCallback);
			this.escapeCallback = undefined;
		}
	}

	hideChatPane() {
		if (this.visibleLeftPane === 'chat') {
			this.toggleLeftPane('chat');
		}
	}

	@Watch('visibleLeftPane')
	onLeftPaneChange(pane: string) {
		if (pane === 'chat') {
			// xs size needs to show the friends list
			if (this.chat.sessionRoomId && !Screen.isXs) {
				enterChatRoom(this.chat, this.chat.sessionRoomId);
			}
		} else {
			leaveChatRoom(this.chat);
		}
	}
}
