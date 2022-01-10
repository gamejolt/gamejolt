<script lang="ts" src="./top-nav"></script>

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
					@click="toggleCbarMenu"
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
