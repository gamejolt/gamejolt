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
				v-app-track-event="`cbar:menu:toggle`"
				class="-control-item"
				@click="toggleLeftPane('library')"
			>
				<app-jolticon class="-control-icon" icon="gamejolt" />
			</a>
		</app-shell-cbar-item>

		<template v-if="user">
			<!-- Chat -->
			<app-shell-cbar-item
				v-if="chat"
				class="-control"
				:highlight="highlight"
				:notification-count="chat.roomNotificationsCount"
				:is-active="visibleLeftPane === 'chat'"
				is-control
			>
				<a
					v-app-tooltip.right="$gettext(`Chat and Friends List (c)`)"
					v-app-track-event="`cbar:chat:toggle`"
					class="-control-item"
					@click="toggleLeftPane('chat')"
				>
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
					v-app-track-event="`cbar:library:toggle`"
					class="-control-item"
					@click="toggleLeftPane('library')"
				>
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
@import '../common'

.shell-cbar-controls
	.-control
		pressy()
		img-circle()
		background-color: var(--theme-bg-offset)
		position: relative
		z-index: 1

		::v-deep(.jolticon)
			color: var(--theme-lighter)

		&-item
			display: flex
			justify-content: center
			align-items: center
			width: $cbar-item-size
			height: $cbar-item-size

		&-icon
			font-size: $jolticon-size * 1.5
</style>
