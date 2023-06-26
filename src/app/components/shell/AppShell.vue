<script lang="ts">
import { computed, defineAsyncComponent, nextTick, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AppClientBase } from '../../../_common/client/safe-exports';
import { Connection } from '../../../_common/connection/connection-service';
import { Meta } from '../../../_common/meta/meta-service';
import AppMinbar from '../../../_common/minbar/minbar.vue';
import AppMobileAppPromotionBanner from '../../../_common/mobile-app/AppMobileAppPromotionBanner.vue';
import { Screen, triggerOnScreenResize } from '../../../_common/screen/screen-service';
import { useSidebarStore } from '../../../_common/sidebar/sidebar.store';
import AppStickerLayer from '../../../_common/sticker/layer/AppStickerLayer.vue';
import { closeStickerDrawer, useStickerStore } from '../../../_common/sticker/sticker-store';
import { useBannerStore } from '../../store/banner';
import { TogglableLeftPane, useAppStore } from '../../store/index';
import { useQuestStore } from '../../store/quest';
import { AppClientShell, AppClientStatusBar } from '../client/safe-exports';
import { useGridStore } from '../grid/grid-store';
import AppQuestWindow from '../quest/window/AppQuestWindow.vue';
import AppShellBanner from './AppShellBanner.vue';
import AppShellBody from './AppShellBody.vue';
import AppShellHotBottom from './AppShellHotBottom.vue';
import AppShellTopNav from './AppShellTopNav.vue';
import AppShellCbar from './cbar/AppShellCbar.vue';
import AppShellSidebar from './sidebar/AppShellSidebar.vue';

const AppChatWindow = defineAsyncComponent(() => import('../chat/window/AppChatWindow.vue'));

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
	unreadNotificationsCount,
	showContextPane,
	clearPanes,
	toggleLeftPane,
} = useAppStore();

const { hasBanner } = useBannerStore();

const {
	showOnRouteChange: shouldShowSidebarOnRouteChange,
	hideOnRouteChange: shouldHideSidebarOnRouteChange,
	showContextOnRouteChange,
} = useSidebarStore();

const stickerStore = useStickerStore();

const { chat } = useGridStore();

const { activeQuest } = useQuestStore();
const activeQuestId = computed(() =>
	typeof activeQuest.value === 'number' ? activeQuest.value : activeQuest.value?.id
);
const activeQuestResource = computed(() =>
	typeof activeQuest.value === 'number' ? undefined : activeQuest.value || undefined
);

const route = useRoute();
const router = useRouter();

const totalChatNotificationsCount = computed(() => chat.value?.roomNotificationsCount ?? 0);
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

type HashEventResult = false | { sidebar: TogglableLeftPane | undefined };

const hashEvents: {
	[key: string]: {
		sidebar: TogglableLeftPane | undefined;
		handler: (trailingValue: string | undefined) => HashEventResult;
	};
} = {
	quest: {
		sidebar: 'quests',
		handler(trailingValue) {
			const questId = trailingValue ? parseInt(trailingValue, 10) : -1;
			if (questId > 0) {
				activeQuest.value = questId;
			} else {
				activeQuest.value = null;
			}

			const sidebar = 'quests';
			if (visibleLeftPane.value !== sidebar) {
				toggleLeftPane(sidebar);
			}
			return { sidebar };
		},
	},
};

function handleHashEvents(): HashEventResult {
	const hash = router.currentRoute.value.hash;
	// Do nothing if there's no hash.
	if (!hash) {
		return false;
	}

	const hashParts = hash.split('-');
	const eventKey = hashParts[0].substring(1);
	const trailingValue = hashParts.length > 1 ? hashParts[1] : undefined;

	let hashEventResult: HashEventResult = false;
	if (eventKey in hashEvents) {
		hashEventResult = hashEvents[eventKey].handler(trailingValue);
	}

	if (hashEventResult) {
		router.replace({
			...router.currentRoute.value,
			hash: '',
		});
		return hashEventResult;
	}

	return false;
}

onMounted(() => {
	handleHashEvents();

	router.afterEach(async (_to, from, _failure) => {
		// Wait for any contextPane state to be changed.
		await nextTick();

		let hashEventResult = handleHashEvents();
		if (!hashEventResult && from.hash) {
			// If our current route navigation doesn't include a hash event, we
			// need to check the previous one to know if our [router.replace()]
			// call triggered this again.
			const hashKey = from.hash.split('-')[0].substring(1);
			if (hashKey in hashEvents) {
				hashEventResult = { sidebar: hashEvents[hashKey].sidebar };
			}
		}

		const hashEventSidebar = (hashEventResult && hashEventResult.sidebar) || false;

		// Show any context panes that are set to show on route change.
		if (shouldShowSidebarOnRouteChange.value) {
			// Only show the context pane if our handled hash event didn't
			// affect any sidebars.
			if (!hashEventSidebar) {
				showContextPane();
			}
			showContextOnRouteChange(false);
			return;
		}

		// Hide all panes if our hash event didn't touch sidebars and we aren't
		// showing one on route change.
		if (!hashEventSidebar && shouldHideSidebarOnRouteChange.value) {
			clearPanes();
		}

		closeStickerDrawer(stickerStore);
	});
});

// Since the cbar takes up width from the whole screen, we want to trigger a
// screen "resize" event so that content can recalculate.
watch(hasCbar, async () => {
	await nextTick();
	triggerOnScreenResize();
});

// Keep the title up to date with notification counts.
watch([totalChatNotificationsCount, unreadActivityCount, unreadNotificationsCount], () => {
	Meta.notificationsCount =
		unreadActivityCount.value +
		unreadNotificationsCount.value +
		totalChatNotificationsCount.value;
});
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

.chat-window
	top: 0
	left: 0
	right: 0
	bottom: 0

	@media $media-sm-up
		top: $shell-top-nav-height
		left: calc(var(--shell-content-sidebar-width) + var(--shell-cbar-width))

.quest-window
	top: 0
	left: 0
	right: 0
	bottom: 0

	@media $media-md-up
		top: $shell-top-nav-height
		left: calc(var(--shell-content-sidebar-width) + var(--shell-cbar-width))

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

		#shell-top-nav
			top: $shell-top-nav-height

		.shell-pane
		#shell-cbar
			top: $shell-top-nav-height * 2

		#shell-body
			padding-top: $shell-top-nav-height * 2

		@media $media-sm-up
			.chat-window
				top: $shell-top-nav-height * 2

		--scroll-affix-top: $shell-top-nav-height * 2

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
