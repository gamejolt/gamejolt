import View from '!view!./chat.html';
import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { EscapeStack } from '../../../../lib/gj-lib-client/components/escape-stack/escape-stack.service';
import {
	EventBus,
	EventBusDeregister,
} from '../../../../lib/gj-lib-client/components/event-bus/event-bus.service';
import { Favicon } from '../../../../lib/gj-lib-client/components/favicon/favicon.service';
import { Screen } from '../../../../lib/gj-lib-client/components/screen/screen-service';
import { AppScrollInviewParent } from '../../../../lib/gj-lib-client/components/scroll/inview/parent';
import { Store } from '../../../store/index';
import { ChatClient, ChatNewMessageEvent } from '../../chat/client';
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

	private isWindowFocused = false;
	private unfocusedNotificationsCount = 0;

	private newMessageDeregister?: EventBusDeregister;
	private focusCallback?: EventListener;
	private blurCallback?: EventListener;
	private escapeCallback?: Function;

	get totalNotificationsCount() {
		return this.chat.roomNotificationsCount + this.unfocusedNotificationsCount;
	}

	mounted() {
		this.blurCallback = () => (this.isWindowFocused = false);
		this.focusCallback = () => (this.isWindowFocused = true);
		this.escapeCallback = () => this.hideChatPane();
		this.newMessageDeregister = EventBus.on('Chat.newMessage', (event: ChatNewMessageEvent) => {
			// If we have a general room open, and our window is unfocused or
			// minimized, then increment our room notifications count (since
			// they haven't seen this message yet). Note that if these messages
			// came in because we were priming output for a room with old
			// messages, we don't want to increase notification counts.
			if (!this.isWindowFocused && this.chat.room) {
				if (
					!event.isPrimer &&
					event.message &&
					event.message.roomId === this.chat.room.id
				) {
					++this.unfocusedNotificationsCount;
				}
			}
		});

		window.addEventListener('blur', this.blurCallback);
		window.addEventListener('focus', this.focusCallback);
		EscapeStack.register(this.escapeCallback);
	}

	destroyed() {
		Favicon.reset();

		if (this.newMessageDeregister) {
			this.newMessageDeregister();
			this.newMessageDeregister = undefined;
		}

		if (this.blurCallback) {
			window.removeEventListener('blur', this.blurCallback);
			this.blurCallback = undefined;
		}

		if (this.focusCallback) {
			window.removeEventListener('blur', this.focusCallback);
			this.focusCallback = undefined;
		}

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

	// Keep the favicon up to date with chat notification counts.
	@Watch('totalNotificationsCount')
	onNotificationsCountChange(count: number) {
		if (count) {
			Favicon.badge(count);
		} else {
			Favicon.reset();
		}
	}

	@Watch('isWindowFocused')
	onWindowFocusChanged(isFocused: boolean) {
		// When the window is unfocused, start counting notifications for
		// current room.
		if (!isFocused) {
			// Notify the client that we are unfocused, so it should start
			// accumulating notifications for the current room.
			this.chat.setFocused(false);
		} else {
			// When we focus it back, clear out all accumulated notifications.
			// Set that we're not longer focused, and clear out room
			// notifications. The user has now "seen" the messages.
			this.unfocusedNotificationsCount = 0;

			// Notify the client that we aren't unfocused anymore.
			this.chat.setFocused(true);
		}
	}
}
