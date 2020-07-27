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

		<!-- <app-expand class="-expand" :when="shouldShowCommunity">
			<transition name="-community">
				<div v-if="shouldShowCommunity">
					<app-shell-cbar-community
						:key="community.id"
						class="anim-fade-in"
						:community="community"
					/>
				</div>
			</transition>
		</app-expand> -->
	</div>
</template>

<script lang="ts" src="./controls"></script>

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

	// AppExpand has 'overflow: hidden', so we need to shift
	// the slot content to allow the cbar item blip to be visible.
	> .-expand
		width: $cbar-item-size + $cbar-blip-size
		padding-left: $cbar-blip-size
		margin-left: -($cbar-blip-size)

// Transition for when the unjoined community is leaving.
// Since the <transition> tag is nested within AppExpand, it will disappear shortly after the 'when' prop is false,
// causing it to be unable to add transitions to the unjoined community once it reenters the DOM.
.-community
	&-leave-active
		transition: opacity 0.3s
		transition-timing-function: $strong-ease-out

	&-leave-to
		opacity: 0
</style>
