<template>
	<div id="shell-cbar" class="theme-dark">
		<app-scroll-scroller class="-scroller" hide-scrollbar>
			<div class="-inner">
				<app-shell-cbar-item
					v-if="chat"
					:notification-count="chat.friendNotificationsCount"
					is-control
				>
					<a
						v-if="chat"
						class="navbar-item no-bar"
						:class="{ active: visibleLeftPane === 'chat' }"
						@click="toggleLeftPane('chat')"
						v-app-tooltip.right="$gettext(`Chat and Friends List (c)`)"
					>
						<!-- TODO: Event changed from 'top-nav' to 'cbar', gotta make sure that's appropriate. -->
						<!-- v-app-track-event="`cbar:chat:toggle`" -->
						<app-jolticon icon="user-messages" />
					</a>
				</app-shell-cbar-item>

				<app-shell-cbar-item is-control v-app-tooltip.right="$gettext(`Playlists (m)`)">
					<a
						class="navbar-item no-bar"
						@click="toggleLeftPane('playlists')"
						v-app-tooltip.right="$gettext(`Playlists (m)`)"
					>
						<!-- TODO: Event changed from 'top-nav:main-menu' to 'cbar:playlists', gotta make sure that's appropriate. -->
						<!-- v-app-track-event="`cbar:playlists:toggle`" -->
						<app-jolticon icon="playlist" />
					</a>
				</app-shell-cbar-item>

				<hr class="-hr" />

				<transition-group name="-communities">
					<app-shell-cbar-community
						v-for="community of communities"
						:key="community.id"
						:community="community"
					/>
				</transition-group>
				<app-shell-cbar-item>
					<app-community-discover-widget tooltip-placement="right" @contextmenu.native.prevent />
				</app-shell-cbar-item>
				<app-shell-cbar-item>
					<app-community-add-widget tooltip-placement="right" @contextmenu.native.prevent />
				</app-shell-cbar-item>
			</div>
		</app-scroll-scroller>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

#shell-cbar
	change-bg('darkest')
	position: fixed
	width: $shell-cbar-width
	z-index: $zindex-cbar

	.-hr
		width: 50%
		margin: ($grid-gutter-width-xs / 2) auto

.-communities-move
	transition: transform 0.3s
	transition-timing-function: $ease-out-back

.-scroller
	position: relative
	width: 100%
	height: 100%

.-inner
	padding: 15px $cbar-h-padding
</style>

<script lang="ts" src="./cbar"></script>
