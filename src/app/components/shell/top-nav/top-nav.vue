<template>
	<nav id="shell-top-nav" class="navbar backdrop-affected">
		<div ref="left" class="navbar-left" :style="{ 'min-width': minColWidth }">
			<div v-app-observe-dimensions="checkColWidths" class="-col">
				<a
					v-if="Screen.isXs"
					class="-small-cbar navbar-item"
					:class="{
						active: !!visibleLeftPane,
					}"
					@click="toggleCbarMenu"
				>
					<!-- JODO: Might need to change this event tracking? -->
					<!-- v-app-track-event="`top-nav:main-menu:toggle`" -->
					<app-jolticon icon="menu" />
				</a>

				<!-- History Navigator (for desktop client) -->
				<app-client-history-navigator v-if="GJ_IS_CLIENT" />

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
						src="~img/game-jolt-logo.svg"
						alt=""
						strict-colors
					/>
					<app-theme-svg v-else src="~img/jolt.svg" alt="" strict-colors />
					<span
						v-if="unreadActivityCount > 0"
						class="notification-tag tag tag-highlight anim-fade-enter anim-fade-leave"
					>
						{{ unreadActivityCount < 100 ? unreadActivityCount : '99+' }}
					</span>
				</router-link>

				<router-link
					v-if="!Screen.isXs && app.user"
					v-app-track-event="`top-nav:main-menu:discover`"
					class="-explore navbar-item"
					:class="{ active: $route.name === 'discover.home' }"
					:to="{ name: 'discover.home' }"
				>
					<app-jolticon icon="compass-needle" class="-explore-icon" />
					<strong class="text-upper">
						<translate>Explore</translate>
					</strong>
				</router-link>

				<app-popper
					v-if="!Screen.isXs"
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
								v-if="!GJ_IS_CLIENT && !Screen.isXs"
								v-app-track-event="`sidebar:client`"
								class="list-group-item has-icon offline-disable"
								:to="{ name: 'landing.client' }"
							>
								<app-jolticon icon="client" />
								<translate>Client</translate>
							</router-link>
							<router-link
								v-app-track-event="`sidebar:forums`"
								class="list-group-item has-icon offline-disable"
								:to="{ name: 'forums.landing.overview' }"
							>
								<app-jolticon icon="forums" />
								<translate>Forums</translate>
							</router-link>
							<a
								v-app-track-event="`sidebar:jams`"
								class="list-group-item has-icon offline-disable"
								:href="Environment.jamsBaseUrl"
								target="_blank"
							>
								<app-jolticon icon="jams" />
								<translate>Jams</translate>
							</a>
						</div>
					</template>
				</app-popper>
			</div>
		</div>

		<div class="navbar-center">
			<div class="-search">
				<!-- Search Input -->
				<app-search v-if="shouldShowSearch" />
			</div>
		</div>

		<!--
			Hide this until we load the user data in, otherwise it'll flash
			login/join buttons.
			https://github.com/gamejolt/issue-tracker/issues/382
		-->
		<div
			v-if="app.userBootstrapped"
			ref="right"
			class="navbar-right"
			:style="{ 'min-width': minColWidth }"
		>
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

<script lang="ts" src="./top-nav"></script>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

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
		min-width: 40px
		transition: min-width 300ms $weak-ease-out

		&.active
			min-width: $shell-cbar-width

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

.navbar-left
.navbar-right
	display: flex

.navbar-right
	justify-content: flex-end
</style>
