<script lang="ts" src="./controls"></script>

<template>
	<div class="shell-cbar-controls">
		<!-- Library - Screen.isXs -->
		<app-shell-cbar-item
			v-if="Screen.isXs"
			class="-control"
			:highlight="highlight"
			:is-active="visibleLeftPane === 'library'"
			is-control
		>
			<a
				v-app-tooltip.right="$gettext(`Game Library (m)`)"
				class="-control-item"
				@click="toggleLeftPane('library')"
			>
				<!-- JODO: Might want to use the same event here as the playlists icon, not sure yet. -->
				<!-- v-app-track-event="`cbar:playlists:toggle`" -->
				<app-jolticon class="-control-icon" icon="gamejolt" />
			</a>
		</app-shell-cbar-item>

		<template v-if="user">
			<!-- Chat -->
			<app-shell-cbar-item
				v-if="chat"
				class="-control"
				:highlight="highlight"
				:notification-count="chat.friendNotificationsCount"
				:is-active="visibleLeftPane === 'chat'"
				is-control
			>
				<a
					v-app-tooltip.right="$gettext(`Chat and Friends List (c)`)"
					class="-control-item"
					@click="toggleLeftPane('chat')"
				>
					<!-- JODO: Event changed from 'top-nav' to 'cbar', gotta make sure that's appropriate. -->
					<!-- v-app-track-event="`cbar:chat:toggle`" -->
					<app-jolticon class="-control-icon" icon="user-messages" />
				</a>
			</app-shell-cbar-item>

			<!-- Library - !Screen.isXs -->
			<app-shell-cbar-item
				v-if="!Screen.isXs"
				class="-control"
				:highlight="highlight"
				:is-active="visibleLeftPane === 'library'"
				is-control
			>
				<a
					v-app-tooltip.right="$gettext(`Game Library (m)`)"
					class="-control-item"
					@click="toggleLeftPane('library')"
				>
					<!-- JODO: Event changed from 'top-nav:main-menu' to 'cbar:playlists', gotta make sure that's appropriate. -->
					<!-- v-app-track-event="`cbar:playlists:toggle`" -->
					<app-jolticon class="-control-icon" icon="books" />
				</a>
			</app-shell-cbar-item>
		</template>

		<hr v-if="Screen.isXs || user" class="-hr" />
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'
@import '../variables'

.shell-cbar-controls
	.-control
		pressy()
		img-circle()
		background-color: var(--theme-bg-offset)

		>>> .jolticon
			color: var(--theme-lighter)

		&-item
			display: flex
			justify-content: center
			align-items: center
			width: $cbar-item-size
			height: $cbar-item-size

		&-icon
			font-size: $jolticon-size * 1.5

	> .-hr
		border-top-width: $border-width-large
		width: 50%
		margin: ($grid-gutter-width-xs / 2) auto
</style>
