import Vue from 'vue';
import { Component, InjectReactive, Watch } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import {
	EscapeStack,
	EscapeStackCallback,
} from '../../../../_common/escape-stack/escape-stack.service';
import { Screen } from '../../../../_common/screen/screen-service';
import AppScrollScroller from '../../../../_common/scroll/scroller/scroller.vue';
import AppShortkey from '../../../../_common/shortkey/shortkey.vue';
import { Store } from '../../../store/index';
import { ChatClient, ChatKey, enterChatRoom, leaveChatRoom } from '../../chat/client';
import AppChatSidebar from '../../chat/sidebar/sidebar.vue';
import AppChatWindows from '../../chat/windows/windows.vue';

@Component({
	components: {
		AppScrollScroller,
		AppChatSidebar,
		AppChatWindows,
		AppShortkey,
	},
})
export default class AppShellChat extends Vue {
	// Chat should be available since we only include in DOM if chat is
	// bootstrapped.
	@InjectReactive(ChatKey) chat!: ChatClient;

	@State
	isRightPaneVisible!: Store['isRightPaneVisible'];

	@Action
	toggleRightPane!: Store['toggleRightPane'];

	private escapeCallback?: EscapeStackCallback;

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

	showChatPane() {
		if (!this.isRightPaneVisible) {
			this.toggleRightPane();
		}
	}

	hideChatPane() {
		if (this.isRightPaneVisible) {
			this.toggleRightPane();
		}
	}

	@Watch('isRightPaneVisible')
	onRightPaneChange(isVisible: boolean) {
		if (isVisible) {
			// xs size needs to show the friends list
			if (this.chat.sessionRoomId && !Screen.isXs) {
				enterChatRoom(this.chat, this.chat.sessionRoomId);
			}
		} else {
			leaveChatRoom(this.chat);
		}
	}
}
