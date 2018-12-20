import View from '!view!./chat.html';
import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { EscapeStack } from '../../../../lib/gj-lib-client/components/escape-stack/escape-stack.service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppScrollInviewParent } from '../../../../lib/gj-lib-client/components/scroll/inview/parent';
import { Store } from '../../../store/index';
import { ChatClient } from '../../chat/client';
import { AppChatSidebar } from '../../chat/sidebar/sidebar';
import { AppChatWindows } from '../../chat/windows/windows';

@View
@Component({
	components: {
		AppScrollInviewParent,
		AppChatSidebar,
		AppChatWindows,
	},
})
export class AppShellChat extends Vue {
	// Chat should be available since we only include in DOM if chat is
	// bootstrapped.
	@State
	chat!: ChatClient;

	@State
	isRightPaneVisible!: Store['isRightPaneVisible'];

	@Action
	toggleRightPane!: Store['toggleRightPane'];

	private escapeCallback?: Function;

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
				this.chat.enterRoom(this.chat.sessionRoomId);
			}
		} else {
			this.chat.leaveRoom();
		}
	}
}
