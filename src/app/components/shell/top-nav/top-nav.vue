<script lang="ts">
import { defineAsyncComponent } from '@vue/runtime-core';
import { setup } from 'vue-class-component';
import { Inject, Options, Vue } from 'vue-property-decorator';
import { shouldShowAppPromotion } from '../../../../utils/mobile-app';
import { trackAppPromotionClick } from '../../../../_common/analytics/analytics.service';
import { AppClientHistoryNavigator } from '../../../../_common/client/safe-exports';
import { AppConfigLoaded } from '../../../../_common/config/loaded';
import { Connection } from '../../../../_common/connection/connection-service';
import { Environment } from '../../../../_common/environment/environment.service';
import { AppObserveDimensions } from '../../../../_common/observe-dimensions/observe-dimensions.directive';
import AppPopper from '../../../../_common/popper/popper.vue';
import { Screen } from '../../../../_common/screen/screen-service';
import { useCommonStore } from '../../../../_common/store/common-store';
import AppThemeSvg from '../../../../_common/theme/svg/AppThemeSvg.vue';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { imageGameJoltLogo, imageJolt } from '../../../img/images';
import { useAppStore } from '../../../store/index';
import { ChatStore, ChatStoreKey } from '../../chat/chat-store';
import AppSearch from '../../search/search.vue';

@Options({
	components: {
		AppPopper,
		AppShellAccountPopover: defineAsyncComponent(
			() => import('../account-popover/account-popover.vue')
		),
		AppShellFriendRequestPopover: defineAsyncComponent(
			() => import('../friend-request-popover/friend-request-popover.vue')
		),
		AppShellNotificationPopover: defineAsyncComponent(
			() => import('../notification-popover/notification-popover.vue')
		),
		AppSearch,
		AppThemeSvg,
		AppConfigLoaded,
		AppClientHistoryNavigator,
	},
	directives: {
		AppTooltip,
		AppObserveDimensions,
	},
})
export default class AppShellTopNav extends Vue {
	store = setup(() => useAppStore());
	commonStore = setup(() => useCommonStore());

	@Inject({ from: ChatStoreKey })
	chatStore!: ChatStore;

	get app() {
		return this.commonStore;
	}

	get visibleLeftPane() {
		return this.store.visibleLeftPane;
	}
	get hasSidebar() {
		return this.store.hasSidebar;
	}
	get hasCbar() {
		return this.store.hasCbar;
	}
	get unreadActivityCount() {
		return this.store.unreadActivityCount;
	}

	moreMenuShowing = false;
	baseMinColWidth: number | null = null;

	declare $refs: {
		left: HTMLDivElement;
		right: HTMLDivElement;
	};

	readonly Environment = Environment;
	readonly Screen = Screen;
	readonly Connection = Connection;
	readonly trackAppPromotionClick = trackAppPromotionClick;
	readonly imageJolt = imageJolt;
	readonly imageGameJoltLogo = imageGameJoltLogo;

	get chat() {
		return this.chatStore.chat!;
	}

	get isTimedOut() {
		return this.app.isUserTimedOut;
	}

	get shouldShowSearch() {
		return !Screen.isXs && !this.isTimedOut;
	}

	get shouldShowMenu() {
		return Screen.isXs && !this.isTimedOut;
	}

	get shouldShowExplore() {
		return !Screen.isXs && this.app.user && !this.isTimedOut;
	}

	get shouldShowMoreMenu() {
		return !Screen.isXs && !this.isTimedOut;
	}

	get shouldShowAppPromotion() {
		return shouldShowAppPromotion(this.$route);
	}

	get humanizedActivityCount() {
		return this.unreadActivityCount < 100 ? this.unreadActivityCount : '99+';
	}

	get minColWidth() {
		// When we are smaller than this, we just set the search to stretch
		// full-width with a max-width. It mostly looks fine on sizes smaller
		// than this.
		if (Screen.width < 1300) {
			return null;
		}

		return this.baseMinColWidth + 'px';
	}

	// Every time either the left or right column's dimensions changes, we run
	// this function.
	checkColWidths() {
		const left = (this.$refs.left && this.$refs.left.getBoundingClientRect().width) || 0;
		const right = (this.$refs.right && this.$refs.right.getBoundingClientRect().width) || 0;

		// We want to size both columns to be the same width, so choose the
		// largest among them.
		let max = Math.max(left, right);
		if (!max) {
			this.baseMinColWidth = null;
			return;
		}

		// Page content is centered within a column that is offset by the cbar (value of $shell-cbar-width),
		// so this does the same offseting within the top nav for the search bar
		// to align properly in the center with the page content.
		if (this.hasCbar) {
			max -= 70;
		}

		this.baseMinColWidth = max;
	}
}
</script>

<template>
	<nav id="shell-top-nav" class="navbar backdrop-affected">
		<div ref="left" class="navbar-left" :style="{ 'min-width': minColWidth }">
			<div v-app-observe-dimensions="checkColWidths" class="-col">
				<a
					v-if="shouldShowMenu"
					v-app-track-event="`top-nav:cbar:toggle`"
					class="-small-cbar navbar-item"
					:class="{
						active: !!visibleLeftPane,
					}"
					@click="store.toggleCbarMenu()"
				>
					<app-jolticon icon="menu" />
					<div
						v-if="chatStore.chat && chat.roomNotificationsCount > 0"
						class="-notification-chat notification-tag tag tag-highlight"
					>
						{{ chat.roomNotificationsCount }}
					</div>
				</a>

				<!-- History Navigator (for desktop app) -->
				<app-client-history-navigator />

				<router-link
					v-app-track-event="`top-nav:main-menu:home`"
					class="navbar-item"
					:class="{
						active: $route.name === 'home',
						'-small-home': Screen.isSm,
					}"
					:to="{ name: 'home' }"
				>
					<app-theme-svg
						v-if="!Screen.isMobile"
						:src="imageGameJoltLogo"
						alt=""
						strict-colors
					/>
					<app-theme-svg v-else :src="imageJolt" alt="" strict-colors />
					<span
						v-if="unreadActivityCount > 0"
						class="notification-tag tag tag-highlight anim-fade-enter anim-fade-leave"
					>
						{{ humanizedActivityCount }}
					</span>
				</router-link>

				<router-link
					v-if="shouldShowExplore"
					v-app-track-event="`top-nav:main-menu:discover`"
					class="navbar-item"
					:class="{ active: $route.name === 'discover.home' }"
					:to="{ name: 'discover.home' }"
				>
					<app-jolticon icon="compass-needle" class="-section-icon" />
					<strong class="text-upper">
						<translate>Explore</translate>
					</strong>
				</router-link>

				<router-link
					v-if="!Screen.isXs"
					v-app-track-event="`top-nav:main-menu:store`"
					class="navbar-item"
					:class="{ active: ($route.name || '').startsWith('discover.games.') }"
					:to="{
						name: 'discover.games.list._fetch',
						params: { section: null },
					}"
				>
					<strong class="text-upper">
						<translate>Store</translate>
					</strong>
				</router-link>

				<app-popper
					v-if="shouldShowMoreMenu"
					v-app-track-event="`top-nav:more-menu:toggle`"
					popover-class="fill-darkest"
					hide-on-state-change
					fixed
					@show="moreMenuShowing = true"
					@hide="moreMenuShowing = false"
				>
					<a class="navbar-item" :class="{ active: moreMenuShowing }">
						<app-jolticon icon="ellipsis-v" />
					</a>

					<template #popover>
						<div class="list-group-dark">
							<router-link
								class="list-group-item has-icon offline-disable"
								:to="{ name: 'landing.app' }"
								@click="
									trackAppPromotionClick({
										source: 'top-nav-options',
										platform: 'mobile',
									})
								"
							>
								<app-jolticon icon="phone" />
								<translate>Get the Mobile App</translate>
							</router-link>

							<router-link
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
								<app-jolticon icon="client" />
								<translate>Get the Desktop App</translate>
							</router-link>

							<router-link
								v-app-track-event="`sidebar:forums`"
								class="list-group-item has-icon offline-disable"
								:to="{ name: 'forums.landing.overview' }"
							>
								<app-jolticon icon="forums" />
								<translate>Forums</translate>
							</router-link>
						</div>
					</template>
				</app-popper>
			</div>
		</div>

		<div class="navbar-center">
			<app-config-loaded class="-search">
				<!-- Search Input -->
				<app-search v-if="shouldShowSearch" />
			</app-config-loaded>
		</div>

		<!--
			Hide this until we load the user data in, otherwise it'll flash
			login/join buttons.
			https://github.com/gamejolt/issue-tracker/issues/382
		-->
		<div
			v-if="app.userBootstrapped && !isTimedOut"
			ref="right"
			class="navbar-right"
			:style="{ 'min-width': minColWidth }"
		>
			<template v-if="Screen.isSm && shouldShowAppPromotion">
				<div class="-button">
					<app-button
						:to="{ name: 'landing.app' }"
						@click="
							trackAppPromotionClick({
								source: 'top-nav',
								platform: 'mobile',
							})
						"
					>
						<translate>Get App</translate>
					</app-button>
				</div>
			</template>
			<template v-else-if="!GJ_IS_DESKTOP_APP && Screen.isDesktop">
				<div class="-button">
					<app-button
						:to="{ name: 'landing.client' }"
						@click="
							trackAppPromotionClick({
								source: 'top-nav',
								platform: 'desktop',
							})
						"
					>
						<translate>Get App</translate>
					</app-button>
				</div>
			</template>

			<div v-app-observe-dimensions="checkColWidths" class="-col">
				<template v-if="app.user">
					<!-- Notifications -->
					<app-shell-notification-popover />

					<!-- Friend Requests -->
					<app-shell-friend-request-popover />

					<!-- Connection Status -->
					<span
						v-if="Connection.isOffline"
						v-app-tooltip.left="
							$gettext(`We're having trouble connecting to Game Jolt.`)
						"
						class="navbar-item disconnected-icon"
					>
						<app-jolticon icon="offline" />
					</span>

					<!-- User Menu -->
					<app-shell-account-popover />
				</template>

				<!-- Login/Join Buttons -->
				<template v-if="!app.user">
					<ul class="navbar-items">
						<li>
							<a
								v-app-track-event="`top-nav:login:click`"
								:href="Environment.authBaseUrl + '/login'"
							>
								<translate>nav.login</translate>
							</a>
						</li>
						<li>
							<a
								v-app-track-event="`top-nav:join:click`"
								:href="Environment.authBaseUrl + '/join'"
							>
								<translate>Sign Up</translate>
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
