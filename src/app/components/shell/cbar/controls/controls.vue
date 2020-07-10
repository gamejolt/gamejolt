<template>
	<div class="shell-cbar-controls">
		<app-shell-cbar-item
			v-if="Screen.isXs"
			:is-active="visibleLeftPane === 'library'"
			is-control
		>
			<a
				class="-control"
				@click="toggleLeftPane('library')"
				v-app-tooltip.right="$gettext(`Game Library (m)`)"
			>
				<!-- JODO: Might want to use the same event here as the playlists icon, not sure yet. -->
				<!-- v-app-track-event="`cbar:playlists:toggle`" -->
				<app-jolticon class="-control-icon" icon="gamejolt" />
			</a>
		</app-shell-cbar-item>

		<app-shell-cbar-item
			v-if="chat"
			:notification-count="chat.friendNotificationsCount"
			:is-active="visibleLeftPane === 'chat'"
			is-control
		>
			<a
				class="-control"
				@click="toggleLeftPane('chat')"
				v-app-tooltip.right="$gettext(`Chat and Friends List (c)`)"
			>
				<!-- JODO: Event changed from 'top-nav' to 'cbar', gotta make sure that's appropriate. -->
				<!-- v-app-track-event="`cbar:chat:toggle`" -->
				<app-jolticon class="-control-icon" icon="user-messages" />
			</a>
		</app-shell-cbar-item>

		<app-shell-cbar-item
			v-if="!Screen.isXs"
			:is-active="visibleLeftPane === 'library'"
			is-control
		>
			<a
				class="-control"
				@click="toggleLeftPane('library')"
				v-app-tooltip.right="$gettext(`Game Library (m)`)"
			>
				<!-- JODO: Event changed from 'top-nav:main-menu' to 'cbar:playlists', gotta make sure that's appropriate. -->
				<!-- v-app-track-event="`cbar:playlists:toggle`" -->
				<app-jolticon class="-control-icon" icon="books" />
			</a>
		</app-shell-cbar-item>

		<hr class="-hr" />
	</div>
</template>

<script lang="ts" src="./controls"></script>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '../variables'

.shell-cbar-controls
	.-control
		display: flex
		justify-content: center
		align-items: center
		width: $cbar-item-size
		height: $cbar-item-size

		&-icon
			font-size: $jolticon-size * 1.5

	.-hr
		width: 50%
		margin: ($grid-gutter-width-xs / 2) auto
</style>
