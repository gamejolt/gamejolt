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
				<div ref="stickerOrigin" class="-sticker-origin" />
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

.-sticker-origin
	position: absolute
	top: 0
	left: 0
	right: 0
	bottom: 0
	pointer-events: none
	user-select: none
	z-index: 2
</style>

<style lang="stylus">
.sticker-img-q347i9o5v6ynw489
	position: fixed
	display: block
	z-index: 100
	pointer-events: none
	user-select: none
	width: 50px
	height: 50px
	top: 12px
	left: 12px
	animation-name: sticker-img-q347i9o5v6ynw489-popcorn
	animation-duration: 1s
	animation-timing-function: ease-out

@keyframes sticker-img-q347i9o5v6ynw489-popcorn
	0%
		transform: none
		opacity: 1

	100%
		transform: translateX(200px) translateY(50px) rotateZ(270deg) scale(0.5)
		opacity: 0
</style>
