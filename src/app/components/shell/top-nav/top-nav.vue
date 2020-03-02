<template>
	<nav id="shell-top-nav" class="navbar backdrop-affected">
		<div ref="left" class="navbar-left" :style="{ 'min-width': minColWidth }">
			<div class="-col" v-app-observe-dimensions="checkColWidths">
				<a
					v-if="hasSidebar"
					class="navbar-item"
					:class="{
						'-menu-toggle': hasCbar,
						active: isLeftPaneVisible,
					}"
					@click="toggleLeftPane"
					v-app-tooltip.right="$gettext(`Playlists (m)`)"
					v-app-track-event="`top-nav:main-menu:toggle`"
				>
					<app-jolticon icon="menu" />
				</a>

				<!-- History Navigator (for desktop client) -->
				<app-client-history-navigator v-if="GJ_IS_CLIENT" />

				<router-link
					class="navbar-item"
					:class="{ active: $route.name === 'home' }"
					:to="{ name: 'home' }"
					v-app-track-event="`top-nav:main-menu:home`"
				>
					<app-theme-svg v-if="!Screen.isMobile" src="~img/game-jolt-logo.svg" alt="" />
					<app-theme-svg v-else src="~img/jolt.svg" alt="" />
					<span
						class="notification-tag tag tag-highlight anim-fade-enter anim-fade-leave"
						v-if="unreadActivityCount > 0"
					>
						{{ unreadActivityCount < 100 ? unreadActivityCount : '99+' }}
					</span>
				</router-link>

				<router-link
					v-if="!Screen.isXs && app.user"
					class="-explore navbar-item"
					:class="{ active: $route.name === 'discover.home' }"
					:to="{ name: 'discover.home' }"
					v-app-track-event="`top-nav:main-menu:discover`"
				>
					<app-jolticon icon="compass-needle" class="-explore-icon" />
					<strong class="text-upper">
						<translate>Explore</translate>
					</strong>
				</router-link>

				<app-popper
					v-if="!Screen.isXs"
					hide-on-state-change
					@show="moreMenuShowing = true"
					@hide="moreMenuShowing = false"
					v-app-track-event="`top-nav:more-menu:toggle`"
				>
					<a class="navbar-item" :class="{ active: moreMenuShowing }">
						<app-jolticon icon="ellipsis-v" />
					</a>

					<div class="fill-darkest" slot="popover">
						<div class="list-group-dark">
							<router-link
								class="list-group-item has-icon offline-disable"
								v-if="!GJ_IS_CLIENT && !Screen.isXs"
								:to="{ name: 'landing.client' }"
								v-app-track-event="`sidebar:client`"
							>
								<app-jolticon icon="client" />
								<translate>Client</translate>
							</router-link>
							<router-link
								class="list-group-item has-icon offline-disable"
								:to="{ name: 'forums.landing.overview' }"
								v-app-track-event="`sidebar:forums`"
							>
								<app-jolticon icon="forums" />
								<translate>Forums</translate>
							</router-link>
							<a
								class="list-group-item has-icon offline-disable"
								:href="Environment.jamsBaseUrl"
								target="_blank"
								v-app-track-event="`sidebar:jams`"
							>
								<app-jolticon icon="jams" />
								<translate>Jams</translate>
							</a>
						</div>
					</div>
				</app-popper>
			</div>
		</div>

		<div class="navbar-center">
			<div class="-search">
				<!-- Search Input -->
				<app-search v-if="!Screen.isXs"></app-search>
			</div>
		</div>

		<!--
			Hide this until we load the user data in, otherwise it'll flash
			login/join buttons.
			https://github.com/gamejolt/issue-tracker/issues/382
		-->
		<div
			ref="right"
			v-if="app.userBootstrapped"
			class="navbar-right"
			:style="{ 'min-width': minColWidth }"
		>
			<div class="-col" v-app-observe-dimensions="checkColWidths">
				<template v-if="app.user">
					<!-- Notifications -->
					<app-shell-notification-popover />

					<!-- Friend Requests -->
					<app-shell-friend-request-popover />

					<!-- Chat -->
					<a
						v-if="chat"
						class="navbar-item"
						:class="{ active: isRightPaneVisible }"
						@click="toggleRightPane"
						v-app-tooltip.left="$gettext(`Chat and Friends List (c)`)"
						v-app-track-event="`top-nav:chat:toggle`"
					>
						<span
							class="notification-tag tag tag-highlight anim-fade-enter anim-fade-leave"
							v-if="chat.friendNotificationsCount"
						>
							{{ chat.friendNotificationsCount }}
						</span>
						<app-jolticon icon="user-messages" />
					</a>

					<!-- Connection Status -->
					<span
						v-if="Connection.isOffline"
						class="navbar-item disconnected-icon"
						v-app-tooltip.left="$gettext(`We're having trouble connecting to Game Jolt.`)"
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
								:href="Environment.authBaseUrl + '/login'"
								v-app-track-event="`top-nav:login:click`"
							>
								<translate>nav.login</translate>
							</a>
						</li>
						<li>
							<a :href="Environment.authBaseUrl + '/join'" v-app-track-event="`top-nav:join:click`">
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
@require '~styles/variables'
@require '~styles-lib/mixins'

#shell-top-nav
	position: fixed
	z-index: $zindex-shell-top-nav

	.disconnected-icon
		theme-prop('color', 'notice')

		&, .jolticon
			cursor: help

// We want to make this the same width as the cbar, so that it aligns.
@media $media-sm-up
	.-menu-toggle
		width: $shell-cbar-width
		text-align: center

.-explore-icon
	position: relative
	top: 2px

// Centered with some spacing around it so it never bunches up too close to the
// navbar columns.
.-search
	margin: 0 auto
	padding-left: 24px
	padding-right: 24px
	max-width: 600px

.navbar-left, .navbar-right
	display: flex

.navbar-right
	justify-content: flex-end
</style>

<script lang="ts" src="./top-nav"></script>
