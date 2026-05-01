<script lang="ts">
import { computed, defineAsyncComponent, nextTick, watch } from 'vue';
import { useRoute } from 'vue-router';

import { AppClientShell, AppClientStatusBar } from '~app/components/client/safe-exports';
import { useGridStore } from '~app/components/grid/grid-store';
import AppShellBanner from '~app/components/shell/AppShellBanner.vue';
import AppShellBody from '~app/components/shell/AppShellBody.vue';
import AppShellHotBottom from '~app/components/shell/AppShellHotBottom.vue';
import AppShellTopNav from '~app/components/shell/AppShellTopNav.vue';
import AppShellCbar from '~app/components/shell/cbar/AppShellCbar.vue';
import { initShellRoutes } from '~app/components/shell/shell-routes';
import AppShellSidebar from '~app/components/shell/sidebar/AppShellSidebar.vue';
import { useBannerStore } from '~app/store/banner';
import { useAppStore } from '~app/store/index';
import { useJoltydexStore } from '~app/store/joltydex';
import { useQuestStore } from '~app/store/quest';
import { AppClientBase } from '~common/client/safe-exports';
import { Connection } from '~common/connection/connection-service';
import { Meta } from '~common/meta/meta-service';
import AppMinbar from '~common/minbar/AppMinbar.vue';
import AppMobileAppPromotionBanner from '~common/mobile-app/AppMobileAppPromotionBanner.vue';
import { getScreen, triggerOnScreenResize } from '~common/screen/screen-service';
import AppStickerLayer from '~common/sticker/layer/AppStickerLayer.vue';

const AppQuestWindow = defineAsyncComponent(
	() => import('~app/components/quest/window/AppQuestWindow.vue')
);
const AppChatWindow = defineAsyncComponent(
	() => import('~app/components/chat/window/AppChatWindow.vue')
);
const AppJoltydexWindow = defineAsyncComponent(
	() => import('~app/components/joltydex/window/AppJoltydexWindow.vue')
);

export const CBAR_WIDTH = 70;
</script>

<script lang="ts" setup>
const {
	isShellHidden,
	hasTopBar,
	hasSidebar,
	hasCbar,
	visibleLeftPane,
	visibleRightPane,
	unreadActivityCount,
	hasUnreadNotifications,
} = useAppStore();

const { hasBanner } = useBannerStore();
const { chat } = useGridStore();
const { activeQuestId, activeQuestResource } = useQuestStore();
const { selectedJoltydexUser } = useJoltydexStore();
const route = useRoute();
const { isXs } = getScreen();

initShellRoutes();

const hasChatNotification = computed(() => chat.value?.roomHasNotifications === true);
const ssrShouldShowSidebar = computed(
	() => import.meta.env.SSR && String(route.name).indexOf('communities.view') === 0
);

const sidebarWidthBase = 270 as const;
const sidebarWidthLg = 470 as const;

/**
 * Width of the current left sidebar.
 */
const sidebarWidth = computed(() => {
	switch (visibleLeftPane.value) {
		case 'backpack':
		case 'quests':
			return sidebarWidthLg;

		default:
			return sidebarWidthBase;
	}
});

const shellCSSVariables = computed(() => {
	const cbarWidth = CBAR_WIDTH;
	const sidebarPadding = 12;

	return [
		`--shell-cbar-width: ${cbarWidth}px`,
		`--shell-content-sidebar-padding: ${sidebarPadding}px`,
		`--shell-content-sidebar-width-base: ${sidebarWidthBase + sidebarPadding * 2}px`,
		`--shell-content-sidebar-width-lg: ${sidebarWidthLg + sidebarPadding * 2}px`,
		`--shell-content-sidebar-width: ${sidebarWidth.value + sidebarPadding * 2}px`,
	];
});

// Since the cbar takes up width from the whole screen, we want to trigger a
// screen "resize" event so that content can recalculate.
watch(hasCbar, async () => {
	await nextTick();
	triggerOnScreenResize();
});

// Keep the title up to date with notification counts.
watch([hasChatNotification, unreadActivityCount, hasUnreadNotifications], () => {
	let count = unreadActivityCount.value;
	count += hasChatNotification.value ? 1 : 0;
	count += hasUnreadNotifications.value ? 1 : 0;
	Meta.notificationsCount = count;
});
</script>

<template>
	<div
		id="shell"
		:class="{
			'is-client-offline': Connection.isClientOffline,
			'left-pane-visible': ssrShouldShowSidebar || !!visibleLeftPane,
			'right-pane-visible': !!visibleRightPane,
			'has-cbar': ssrShouldShowSidebar || (hasCbar && !isXs),
			'has-cbar-mobile': hasCbar && isXs,
			'has-banner': hasBanner && !isShellHidden,
		}"
		:style="shellCSSVariables"
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

		<AppChatWindow
			v-if="visibleLeftPane === 'chat' && chat && chat.populated && chat.activeRoomId"
			:key="chat.activeRoomId"
			:room-id="chat.activeRoomId"
		/>
		<AppQuestWindow
			v-else-if="visibleLeftPane === 'quests' && activeQuestId"
			:key="activeQuestId"
			:quest-id="activeQuestId"
			:resource="activeQuestResource"
		/>
		<AppJoltydexWindow
			v-else-if="visibleLeftPane === 'joltydex' && selectedJoltydexUser"
			:key="selectedJoltydexUser.id"
			:selected-user="selectedJoltydexUser"
		/>

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

<!-- Global -->
<style lang="stylus">
html, body
	// Firefox uses this color to blank the screen before it renders. It's
	// better to use this than constantly flicker black while rendering.
	change-bg('bg', true)

#shell-top-nav
	top: 0
	// If we used `right: 0` instead, the top nav would flex off the screen if
	// a horizontal scrollbar became visible. Doing it this way ensures it's
	// always the correct width.
	width: 100vw
	max-width: 100%

#shell-cbar
	top: $shell-top-nav-height
	left: 0
	bottom: 0

#shell-body
	padding-top: $shell-top-nav-height

#shell-banner
	top: 0
	left: 0
	right: 0

#shell-hot-bottom
	bottom: 0
	left: 0
	right: 0

.growl-container
	bottom: 10px

//
// And now for the long list of positioning shell elements.
//
#shell
	position: relative
	// TODO: We should get the shell components using these instead of all the manual stuff below.
	--shell-top: $shell-top-nav-height
	--shell-bottom: 0px
	--shell-left: 0px
	--shell-right: 0px
	// Affixed components should be shifted down from the top of the shell to make room
	// for the top nav.
	--scroll-affix-top: $shell-top-nav-height

	&.has-banner
		--shell-top: $shell-top-nav-height * 2
		--scroll-affix-top: $shell-top-nav-height * 2

		#shell-top-nav
			top: $shell-top-nav-height

		.shell-pane
		#shell-cbar
			top: $shell-top-nav-height * 2

		#shell-body
			padding-top: $shell-top-nav-height * 2



	&.has-cbar
		--shell-left: var(--shell-cbar-width)

		#shell-body
			padding-left: var(--shell-cbar-width)

	&.has-cbar
	&.has-cbar-mobile
		.shell-pane-left
		#shell-sidebar
			left: var(--shell-cbar-width)

		#shell-cbar
			transform: translateX(0)

body.has-hot-bottom
	#shell
		--shell-bottom: $status-bar-height

	#shell-body
		padding-bottom: $status-bar-height

	.shell-pane
	#shell-cbar
		bottom: $status-bar-height

	.growl-container
		bottom: $status-bar-height + 10px

#shell-body.has-content-sidebar
	#footer
		margin-left: var(--shell-content-sidebar-width-base)

	&.has-cbar
		#footer
			margin-left: calc(var(--shell-content-sidebar-width-base) + var(--shell-cbar-width))
</style>
