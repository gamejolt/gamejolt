<script lang="ts">
import { defineAsyncComponent, nextTick } from 'vue';
import { setup } from 'vue-class-component';
import { Inject, Options, Vue, Watch } from 'vue-property-decorator';
import { shallowSetup } from '../../../utils/vue';
import { AppClientBase } from '../../../_common/client/safe-exports';
import { Connection } from '../../../_common/connection/connection-service';
import { ContentFocus } from '../../../_common/content-focus/content-focus.service';
import { setDrawerOpen, useDrawerStore } from '../../../_common/drawer/drawer-store';
import { Meta } from '../../../_common/meta/meta-service';
import AppMinbar from '../../../_common/minbar/minbar.vue';
import AppMobileAppPromotionBanner from '../../../_common/mobile-app/AppMobileAppPromotionBanner.vue';
import { Screen, triggerOnScreenResize } from '../../../_common/screen/screen-service';
import { useSidebarStore } from '../../../_common/sidebar/sidebar.store';
import AppStickerLayer from '../../../_common/sticker/layer/layer.vue';
import { useCommonStore } from '../../../_common/store/common-store';
import { useBannerStore } from '../../store/banner';
import { useAppStore } from '../../store/index';
import { ChatStore, ChatStoreKey } from '../chat/chat-store';
import { setChatFocused } from '../chat/client';
import { AppClientShell, AppClientStatusBar } from '../client/safe-exports';
import AppShellBanner from './AppShellBanner.vue';
import AppShellBody from './body/body.vue';
import AppShellCbar from './cbar/cbar.vue';
import AppShellHotBottom from './hot-bottom/hot-bottom.vue';
import AppShellSidebar from './sidebar/sidebar.vue';
import AppShellTopNav from './top-nav/AppShellTopNav.vue';

@Options({
	components: {
		AppShellTopNav,
		AppShellBody,
		AppShellSidebar,
		AppShellHotBottom,
		AppShellCbar,
		AppMinbar,
		AppShellBanner,
		AppChatWindow: defineAsyncComponent(() => import('../chat/window/AppChatWindow.vue')),
		AppStickerLayer,
		AppClientBase,
		AppClientShell,
		AppClientStatusBar,
		AppMobileAppPromotionBanner,
	},
})
export default class AppShell extends Vue {
	store = setup(() => useAppStore());
	commonStore = setup(() => useCommonStore());
	bannerStore = setup(() => useBannerStore());
	sidebarStore = setup(() => useSidebarStore());

	drawerStore = shallowSetup(() => useDrawerStore());

	@Inject({ from: ChatStoreKey })
	chatStore!: ChatStore;

	get app() {
		return this.commonStore;
	}

	get isShellHidden() {
		return this.store.isShellHidden;
	}
	get hasTopBar() {
		return this.store.hasTopBar;
	}
	get hasSidebar() {
		return this.store.hasSidebar;
	}
	get hasCbar() {
		return this.store.hasCbar;
	}
	get visibleLeftPane() {
		return this.store.visibleLeftPane;
	}
	get visibleRightPane() {
		return this.store.visibleRightPane;
	}
	get unreadActivityCount() {
		return this.store.unreadActivityCount;
	}
	get unreadNotificationsCount() {
		return this.store.unreadNotificationsCount;
	}

	get hasBanner() {
		return this.bannerStore.hasBanner;
	}

	readonly Connection = Connection;
	readonly Screen = Screen;

	get chat() {
		return this.chatStore.chat;
	}

	get totalChatNotificationsCount() {
		return this.chat?.roomNotificationsCount ?? 0;
	}

	get ssrShouldShowSidebar() {
		return import.meta.env.SSR && String(this.$route.name).indexOf('communities.view') === 0;
	}

	mounted() {
		this.$router.afterEach(async () => {
			/*
				Sidebar/Context Panes
			*/
			// Wait for any contextPane state to be changed.
			await nextTick();

			// Show any context panes that are set to show on route change.
			if (this.sidebarStore.showOnRouteChange) {
				this.store.showContextPane();
				this.sidebarStore.showContextOnRouteChange(false);
				return;
			}

			// Hide all panes if we aren't showing one on route change.
			if (this.sidebarStore.hideOnRouteChange) {
				this.store.clearPanes();
			}

			/*
				DrawerStore
			*/
			setDrawerOpen(this.drawerStore, false);
		});

		this.$watch(
			() => ContentFocus.isWindowFocused,
			(isFocused: boolean) => {
				if (!this.chat) {
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
		await nextTick();
		triggerOnScreenResize();
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
</script>

<template>
	<div
		id="shell"
		:class="{
			'is-client-offline': Connection.isClientOffline,
			'left-pane-visible': ssrShouldShowSidebar || !!visibleLeftPane,
			'right-pane-visible': !!visibleRightPane,
			'has-cbar': ssrShouldShowSidebar || (hasCbar && !Screen.isXs),
			'has-cbar-mobile': hasCbar && Screen.isXs,
			'has-banner': hasBanner && !isShellHidden,
		}"
	>
		<AppStickerLayer>
			<template v-if="isShellHidden">
				<slot />
			</template>
			<AppShellBody v-else>
				<slot />
			</AppShellBody>
		</AppStickerLayer>

		<AppShellTopNav v-if="hasTopBar" />
		<AppShellCbar />
		<AppShellSidebar v-if="hasSidebar" />
		<AppShellBanner v-if="!isShellHidden" />

		<AppChatWindow v-if="visibleLeftPane === 'chat' && chat && chat.room" :room="chat.room" />

		<div v-if="GJ_IS_DESKTOP_APP" key="shell-client">
			<AppClientBase />
			<AppClientShell />
		</div>

		<AppMobileAppPromotionBanner />

		<AppShellHotBottom>
			<AppMinbar v-show="!visibleRightPane" />
			<template v-if="GJ_IS_DESKTOP_APP">
				<AppClientStatusBar key="shell-client-status-bar" />
			</template>
		</AppShellHotBottom>
	</div>
</template>

<style lang="styl" src="./shell.styl"></style>
