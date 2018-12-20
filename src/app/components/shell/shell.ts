import View from '!view!./shell.html';
import { ContentFocus } from 'game-jolt-frontend-lib/components/content-focus/content-focus.service';
import {
	EventBus,
	EventBusDeregister,
} from 'game-jolt-frontend-lib/components/event-bus/event-bus.service';
import { Meta } from 'game-jolt-frontend-lib/components/meta/meta-service';
import { Screen } from 'game-jolt-frontend-lib/components/screen/screen-service';
import Vue from 'vue';
import { Component, Watch } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { Connection } from '../../../lib/gj-lib-client/components/connection/connection-service';
import { AppGrowls } from '../../../lib/gj-lib-client/components/growls/growls';
import { AppLoadingBar } from '../../../lib/gj-lib-client/components/loading/bar/bar';
import { AppMinbar } from '../../../lib/gj-lib-client/components/minbar/minbar';
import { AppModals } from '../../../lib/gj-lib-client/components/modal/modals';
import { BannerModule, BannerStore, Store } from '../../store/index';
import { ChatNewMessageEvent } from '../chat/client';
import { AppShellBody } from './body/body';
import { AppShellCbar } from './cbar/cbar';
import { AppShellHotBottom } from './hot-bottom/hot-bottom';
import './shell.styl';
import { AppShellSidebar } from './sidebar/sidebar';
import { AppShellTopNav } from './top-nav/top-nav';

let components: any = {
	AppShellTopNav,
	AppShellBody,
	AppShellSidebar,
	AppShellHotBottom,
	AppShellCbar,
	AppMinbar,
	AppGrowls,
	AppModals,
	AppLoadingBar,
	AppShellBanner: () =>
		import(/* webpackChunkName: "shell" */ './banner/banner').then(m => m.AppShellBanner),
	AppShellChat: () =>
		import(/* webpackChunkName: "chat" */ './chat/chat').then(m => m.AppShellChat),
};

if (GJ_IS_CLIENT) {
	components = {
		...components,
		...require('../../../_common/client/base/base'),
		...require('./client/client'),
		...require('../client/status-bar/status-bar'),
	};
}

@View
@Component({
	components,
})
export class AppShell extends Vue {
	@State
	app!: Store['app'];

	@State
	chat!: Store['chat'];

	@State
	hasSidebar!: Store['hasSidebar'];

	@State
	hasCbar!: Store['hasCbar'];

	@State
	isLeftPaneVisible!: Store['isLeftPaneVisible'];

	@State
	isRightPaneVisible!: Store['isRightPaneVisible'];

	@State
	unreadActivityCount!: Store['unreadActivityCount'];

	@State
	unreadNotificationsCount!: Store['unreadNotificationsCount'];

	@BannerModule.State
	hasBanner!: BannerStore['hasBanner'];

	@Action
	clearPanes!: Store['clearPanes'];

	private unfocusedChatNotificationsCount = 0;
	private newMessageDeregister?: EventBusDeregister;

	readonly Connection = Connection;
	readonly Screen = Screen;

	get totalChatNotificationsCount() {
		return (
			(this.chat ? this.chat.roomNotificationsCount : 0) +
			this.unfocusedChatNotificationsCount
		);
	}

	mounted() {
		// When changing routes, hide all overlays.
		this.$router.beforeEach((_to, _from, next) => {
			this.clearPanes();
			next();
		});

		this.$watch(
			() => ContentFocus.isWindowFocused,
			isFocused => {
				if (!this.chat) {
					return;
				}

				// When the window is unfocused, start counting notifications
				// for current room.
				if (!isFocused) {
					// Notify the client that we are unfocused, so it should
					// start accumulating notifications for the current room.
					this.chat.setFocused(false);
				} else {
					// When we focus it back, clear out all accumulated
					// notifications. Set that we're not longer focused, and
					// clear out room notifications. The user has now "seen" the
					// messages.
					this.unfocusedChatNotificationsCount = 0;

					// Notify the client that we aren't unfocused anymore.
					this.chat.setFocused(true);
				}
			}
		);

		this.newMessageDeregister = EventBus.on('Chat.newMessage', (event: ChatNewMessageEvent) => {
			// If we have a general room open, and our window is unfocused or
			// minimized, then increment our room notifications count (since
			// they haven't seen this message yet). Note that if these messages
			// came in because we were priming output for a room with old
			// messages, we don't want to increase notification counts.
			if (
				!ContentFocus.isWindowFocused &&
				this.chat &&
				this.chat.room &&
				!event.isPrimer &&
				event.message &&
				event.message.roomId === this.chat.room.id
			) {
				++this.unfocusedChatNotificationsCount;
			}
		});
	}

	destroyed() {
		if (this.newMessageDeregister) {
			this.newMessageDeregister();
			this.newMessageDeregister = undefined;
		}
	}

	// Keep the title up to date with notification counts.
	@Watch('totalChatNotificationsCount')
	@Watch('unreadActivityCount')
	@Watch('unreadNotificationsCount')
	onNotificationsCountChange() {
		Meta.notificationsCount =
			this.unreadActivityCount +
			this.unreadNotificationsCount +
			this.totalChatNotificationsCount;
	}
}
