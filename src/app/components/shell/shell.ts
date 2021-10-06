import Vue from 'vue';
import { Component, Inject, InjectReactive, Watch } from 'vue-property-decorator';
import { Action, State } from 'vuex-class';
import { Connection } from '../../../_common/connection/connection-service';
import { ContentFocus } from '../../../_common/content-focus/content-focus.service';
import { DrawerStore, DrawerStoreKey, setDrawerOpen } from '../../../_common/drawer/drawer-store';
import { Meta } from '../../../_common/meta/meta-service';
import AppMinbar from '../../../_common/minbar/minbar.vue';
import { Screen } from '../../../_common/screen/screen-service';
import {
	SidebarMutation,
	SidebarState,
	SidebarStore,
} from '../../../_common/sidebar/sidebar.store';
import AppStickerLayer from '../../../_common/sticker/layer/layer.vue';
import { BannerModule, BannerStore, Store } from '../../store/index';
import { ChatStore, ChatStoreKey } from '../chat/chat-store';
import { setChatFocused } from '../chat/client';
import AppShellBody from './body/body.vue';
import AppShellCbar from './cbar/cbar.vue';
import AppShellHotBottom from './hot-bottom/hot-bottom.vue';
import './shell.styl';
import AppShellSidebar from './sidebar/sidebar.vue';
import AppShellTopNav from './top-nav/top-nav.vue';

const components: any = {
	AppShellTopNav,
	AppShellBody,
	AppShellSidebar,
	AppShellHotBottom,
	AppShellCbar,
	AppMinbar,
	AppShellBanner: () => import(/* webpackChunkName: "shell" */ './banner/banner.vue'),
	AppChatWindows: () => import(/* webpackChunkName: "chat" */ '../chat/windows/windows.vue'),
	AppStickerLayer,
};

if (GJ_IS_CLIENT) {
	components.AppClientBase = require('../../../_common/client/base/base.vue').default;
	components.AppShellClient = require('./client/client.vue').default;
	components.AppClientStatusBar = require('../client/status-bar/status-bar.vue').default;
}

@Component({
	components,
})
export default class AppShell extends Vue {
	@InjectReactive(ChatStoreKey) chatStore!: ChatStore;
	@Inject(DrawerStoreKey) drawerStore!: DrawerStore;

	@State app!: Store['app'];
	@State isShellHidden!: Store['isShellHidden'];
	@State hasTopBar!: Store['hasTopBar'];
	@State hasSidebar!: Store['hasSidebar'];
	@State hasCbar!: Store['hasCbar'];
	@State visibleLeftPane!: Store['visibleLeftPane'];
	@State visibleRightPane!: Store['visibleRightPane'];
	@State unreadActivityCount!: Store['unreadActivityCount'];
	@State unreadNotificationsCount!: Store['unreadNotificationsCount'];

	@BannerModule.State hasBanner!: BannerStore['hasBanner'];

	@SidebarState activeContextPane!: SidebarStore['activeContextPane'];
	@SidebarState hideOnRouteChange!: SidebarStore['hideOnRouteChange'];
	@SidebarState showOnRouteChange!: SidebarStore['showOnRouteChange'];

	@SidebarMutation showContextOnRouteChange!: SidebarStore['showContextOnRouteChange'];

	@Action showContextPane!: Store['showContextPane'];
	@Action clearPanes!: Store['clearPanes'];

	readonly Connection = Connection;
	readonly Screen = Screen;

	get chat() {
		return this.chatStore.chat!;
	}

	get totalChatNotificationsCount() {
		return this.chatStore.chat ? this.chat.roomNotificationsCount : 0;
	}

	get ssrShouldShowSidebar() {
		return GJ_IS_SSR && this.$route.name?.indexOf('communities.view') === 0;
	}

	mounted() {
		this.$router.afterEach(async () => {
			/*
				Sidebar/Context Panes
			*/
			// Wait for any contextPane state to be changed.
			await this.$nextTick();

			// Show any context panes that are set to show on route change.
			if (this.showOnRouteChange) {
				this.showContextPane();
				this.showContextOnRouteChange(false);
				return;
			}

			// Hide all panes if we aren't showing one on route change.
			if (this.hideOnRouteChange) {
				this.clearPanes();
			}

			/*
				DrawerStore
			*/
			setDrawerOpen(this.drawerStore, false);
		});

		this.$watch(
			() => ContentFocus.isWindowFocused,
			isFocused => {
				if (!this.chatStore.chat) {
					return;
				}

				// When the window is unfocused, start counting notifications
				// for current room.
				if (!isFocused) {
					// Notify the client that we are unfocused, so it should
					// start accumulating notifications for the current room.
					setChatFocused(this.chat, false);
				} else {
					// Notify the client that we aren't unfocused anymore.
					setChatFocused(this.chat, true);
				}
			}
		);
	}

	// Since the cbar takes up width from the whole screen, we want to trigger a
	// screen "resize" event so that content can recalculate.
	@Watch('hasCbar')
	async onShouldShowChange() {
		await this.$nextTick();
		Screen._onResize();
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
