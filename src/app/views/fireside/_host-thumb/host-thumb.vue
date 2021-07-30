<script lang="ts" src="./host-thumb"></script>

<template>
	<div v-app-tooltip="tooltip" class="-thumb" @click="onClick">
		<div ref="player" class="-display-thumb" :class="{ '-hidden': !showingVideoThumb }" />

		<div class="-avatar-wrap" :class="{ '-full': !showingVideoThumb }">
			<app-fireside-host-thumb-indicator :host="host" />
		</div>

		<div class="-spacer" />
		<div class="-active-indicator" :class="{ '-active': isFocused }" />
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-thumb
	position: relative
	display: flex
	flex-direction: column
	align-items: center
	cursor: pointer
	user-select: none
	width: var(--fireside-host-size)
	height: var(--fireside-host-size)

.-display-thumb
	rounded-corners()
	flex: auto
	width: 100%
	background-color: var(--theme-bg-subtle)
	transition: opacity 250ms

	&.-hidden
		opacity: 0

.-avatar-wrap
	position: absolute
	width: calc(var(--fireside-host-size) * 0.6)
	height: calc(var(--fireside-host-size) * 0.6)
	bottom: 0
	transition: all 250ms $strong-ease-out

	&.-full
		width: calc(var(--fireside-host-size) - 12px)
		height: calc(var(--fireside-host-size) - 12px)
		bottom: 12px

.-spacer
	flex: none
	height: calc(var(--fireside-host-size) * 0.3)

.-active-indicator
	flex: none
	border-radius: 40%
	height: 4px
	width: 0
	opacity: 0
	background-color: var(--theme-link)
	transition: width 400ms $ease-out-back, opacity 250ms

	&.-active
		width: 30px
		opacity: 1
</style>
