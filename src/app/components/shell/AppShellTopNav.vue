<script lang="ts" setup>
import { defineAsyncComponent } from '@vue/runtime-core';
import { computed, inject, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { trackAppPromotionClick } from '../../../_common/analytics/analytics.service';
import AppButton from '../../../_common/button/AppButton.vue';
import { AppClientHistoryNavigator } from '../../../_common/client/safe-exports';
import { AppConfigLoaded } from '../../../_common/config/loaded';
import { Connection } from '../../../_common/connection/connection-service';
import { Environment } from '../../../_common/environment/environment.service';
import AppJolticon from '../../../_common/jolticon/AppJolticon.vue';
import { vAppObserveDimensions } from '../../../_common/observe-dimensions/observe-dimensions.directive';
import { Screen } from '../../../_common/screen/screen-service';
import { useCommonStore } from '../../../_common/store/common-store';
import AppThemeSvg from '../../../_common/theme/svg/AppThemeSvg.vue';
import { vAppTooltip } from '../../../_common/tooltip/tooltip-directive';
import AppTranslate from '../../../_common/translate/AppTranslate.vue';
import { imageGameJoltLogo, imageJolt } from '../../img/images';
import { useAppStore } from '../../store/index';
import { ChatStoreKey } from '../chat/chat-store';
import AppSearch from '../search/AppSearch.vue';
import AppShellQuestIcon from './AppShellQuestIcon.vue';

const AppShellAccountPopover = defineAsyncComponent(() => import('./AppShellAccountPopover.vue'));
const AppShellFriendRequestPopover = defineAsyncComponent(
	() => import('./friend-request-popover/AppShellFriendRequestPopover.vue')
);
const AppShellNotificationPopover = defineAsyncComponent(
	() => import('./notification-popover/AppShellNotificationPopover.vue')
);
const AppShellAltMenuPopover = defineAsyncComponent(() => import('./AppShellAltMenuPopover.vue'));

const { visibleLeftPane, hasCbar, unreadActivityCount, toggleCbarMenu } = useAppStore();
const { isUserTimedOut, user, userBootstrapped } = useCommonStore();
const chatStore = inject(ChatStoreKey)!;

const left = ref<HTMLDivElement>();
const right = ref<HTMLDivElement>();
const baseMinColWidth = ref<number>();

const chat = computed(() => chatStore.chat);
const shouldShowSearch = computed(() => !Screen.isXs && !isUserTimedOut.value);
const shouldShowMenu = computed(() => Screen.isXs && !isUserTimedOut.value);
const shouldShowExplore = computed(() => !Screen.isXs && user.value && !isUserTimedOut.value);
const shouldShowMoreMenu = computed(() => !Screen.isXs && !isUserTimedOut.value);
const humanizedActivityCount = computed(() =>
	unreadActivityCount.value < 100 ? unreadActivityCount.value : '99+'
);

const minColWidth = computed(() => {
	// When we are smaller than this, we just set the search to stretch
	// full-width with a max-width. It mostly looks fine on sizes smaller
	// than this.
	if (Screen.width < 1300) {
		return undefined;
	}

	return baseMinColWidth.value + 'px';
});

// Every time either the left or right column's dimensions changes, we run
// this function.
function _checkColWidths() {
	const leftWidth = left.value?.getBoundingClientRect().width || 0;
	const rightWidth = right.value?.getBoundingClientRect().width || 0;

	// We want to size both columns to be the same width, so choose the
	// largest among them.
	let max = Math.max(leftWidth, rightWidth);
	if (!max) {
		baseMinColWidth.value = undefined;
		return;
	}

	// Page content is centered within a column that is offset by the cbar (value of $shell-cbar-width),
	// so this does the same offseting within the top nav for the search bar
	// to align properly in the center with the page content.
	if (hasCbar.value) {
		max -= 70;
	}

	baseMinColWidth.value = max;
}
</script>

<template>
	<nav id="shell-top-nav" class="navbar backdrop-affected">
		<div ref="left" class="navbar-left" :style="{ 'min-width': minColWidth }">
			<div v-app-observe-dimensions="_checkColWidths" class="-col">
				<a
					v-if="shouldShowMenu"
					v-app-track-event="`top-nav:cbar:toggle`"
					class="-small-cbar navbar-item"
					:class="{
						active: !!visibleLeftPane,
					}"
					@click="toggleCbarMenu()"
				>
					<AppJolticon icon="menu" />
					<div
						v-if="chat && chat.roomNotificationsCount > 0"
						class="-notification-chat notification-tag tag tag-highlight"
					>
						{{ chat.roomNotificationsCount }}
					</div>
				</a>

				<!-- History Navigator (for desktop app) -->
				<template v-if="GJ_IS_DESKTOP_APP">
					<AppClientHistoryNavigator />
				</template>

				<RouterLink
					v-app-track-event="`top-nav:main-menu:home`"
					class="navbar-item"
					:class="{
						active: $route.name === 'home',
						'-small-home': Screen.isSm,
					}"
					to="/"
				>
					<AppThemeSvg
						v-if="!Screen.isMobile"
						:src="imageGameJoltLogo"
						alt=""
						strict-colors
					/>
					<AppThemeSvg v-else :src="imageJolt" alt="" strict-colors />
					<span
						v-if="unreadActivityCount > 0"
						class="notification-tag tag tag-highlight anim-fade-enter anim-fade-leave"
					>
						{{ humanizedActivityCount }}
					</span>
				</RouterLink>

				<RouterLink
					v-if="shouldShowExplore"
					v-app-track-event="`top-nav:main-menu:discover`"
					class="navbar-item"
					:class="{ active: $route.name === 'discover.home' }"
					:to="{ name: 'discover.home' }"
				>
					<AppJolticon icon="compass-needle" class="-section-icon" />
					<strong class="text-upper">
						<AppTranslate>Explore</AppTranslate>
					</strong>
				</RouterLink>

				<RouterLink
					v-if="!Screen.isXs"
					v-app-track-event="`top-nav:main-menu:store`"
					class="navbar-item"
					:class="{ active: String($route.name).startsWith('discover.games.') }"
					:to="{
						name: 'discover.games.list._fetch',
						params: { section: null },
					}"
				>
					<strong class="text-upper">
						<AppTranslate>Store</AppTranslate>
					</strong>
				</RouterLink>

				<AppShellAltMenuPopover v-if="shouldShowMoreMenu" />

				<!-- <AppPopper
					v-if="shouldShowMoreMenu"
					v-app-track-event="`top-nav:more-menu:toggle`"
					popover-class="fill-darkest"
					hide-on-state-change
					fixed
					@show="moreMenuShowing = true"
					@hide="moreMenuShowing = false"
				>
					<a class="navbar-item" :class="{ active: moreMenuShowing }">
						<AppJolticon icon="ellipsis-v" />
					</a>

					<template #popover>
						<div class="list-group-dark">
							<RouterLink
								class="list-group-item has-icon offline-disable"
								:to="{ name: 'landing.app' }"
								@click="
									trackAppPromotionClick({
										source: 'top-nav-options',
										platform: 'mobile',
									})
								"
							>
								<AppJolticon icon="phone" />
								<AppTranslate>Get the Mobile App</AppTranslate>
							</RouterLink>

							<RouterLink
								v-if="!GJ_IS_DESKTOP_APP"
								class="list-group-item has-icon offline-disable"
								:to="{ name: 'landing.client' }"
								@click="
									trackAppPromotionClick({
										source: 'top-nav-options',
										platform: 'desktop',
									})
								"
							>
								<AppJolticon icon="client" />
								<AppTranslate>Get the Desktop App</AppTranslate>
							</RouterLink>
						</div>
					</template>
				</AppPopper> -->
			</div>
		</div>

		<div class="navbar-center">
			<AppConfigLoaded class="-search">
				<!-- Search Input -->
				<AppSearch v-if="shouldShowSearch" />
			</AppConfigLoaded>
		</div>

		<!--
		Hide this until we load the user data in, otherwise it'll flash
		login/join buttons.
		https://github.com/gamejolt/issue-tracker/issues/382
		-->
		<div
			v-if="userBootstrapped && !isUserTimedOut"
			ref="right"
			class="navbar-right"
			:style="{ 'min-width': minColWidth }"
		>
			<template v-if="!GJ_IS_DESKTOP_APP">
				<template v-if="Screen.isSm">
					<div class="-button">
						<AppButton
							:to="{ name: 'landing.app' }"
							@click="
								trackAppPromotionClick({
									source: 'top-nav',
									platform: 'mobile',
								})
							"
						>
							<AppTranslate>Get App</AppTranslate>
						</AppButton>
					</div>
				</template>
				<template v-else-if="Screen.isDesktop">
					<div class="-button">
						<AppButton
							:to="{ name: 'landing.client' }"
							@click="
								trackAppPromotionClick({
									source: 'top-nav',
									platform: 'desktop',
								})
							"
						>
							<AppTranslate>Get App</AppTranslate>
						</AppButton>
					</div>
				</template>
			</template>

			<div v-app-observe-dimensions="_checkColWidths" class="-col">
				<template v-if="user">
					<AppShellQuestIcon />

					<!-- Notifications -->
					<AppShellNotificationPopover />

					<!-- Friend Requests -->
					<AppShellFriendRequestPopover />

					<!-- Connection Status -->
					<span
						v-if="Connection.isOffline"
						v-app-tooltip.left="
							$gettext(`We're having trouble connecting to Game Jolt.`)
						"
						class="navbar-item disconnected-icon"
					>
						<AppJolticon icon="offline" />
					</span>

					<!-- User Menu -->
					<AppShellAccountPopover />
				</template>

				<!-- Login/Join Buttons -->
				<template v-if="!user">
					<ul class="navbar-items">
						<li>
							<a
								v-app-track-event="`top-nav:login:click`"
								:href="Environment.authBaseUrl + '/login'"
							>
								<AppTranslate>Log In</AppTranslate>
							</a>
						</li>
						<li>
							<a
								v-app-track-event="`top-nav:join:click`"
								:href="Environment.authBaseUrl + '/join'"
							>
								<AppTranslate>Sign Up</AppTranslate>
							</a>
						</li>
					</ul>
				</template>
			</div>
		</div>
	</nav>
</template>

<style lang="stylus" scoped>
#shell-top-nav
	position: fixed
	z-index: $zindex-shell-top-nav

	.disconnected-icon
		theme-prop('color', 'notice')

		&
		.jolticon
			cursor: help

// Make the small top-nav items the same width as the cbar while the cbar is showing.
.-small
	&-home
		text-align: center
		width: $shell-cbar-width

	// Transition the width of the cbar toggle to better match up with the cbar.
	&-cbar
		text-align: center
		min-width: 50px
		transition: min-width 300ms $weak-ease-out

		&.active
			min-width: $shell-cbar-width

		.-notification-chat
			pointer-events: none
			position: absolute
			top: 0
			right: 0

.-section-icon
	position: relative
	top: 2px

// Centered with some spacing around it so it never bunches up too close to the
// navbar columns.
.-search
	margin: 0 auto
	padding-left: 24px
	padding-right: 24px
	max-width: 600px

.-button
	display: flex
	align-items: center
	justify-content: center
	margin-right: 12px

.navbar-left
.navbar-right
	display: flex

.navbar-right
	justify-content: flex-end
</style>
