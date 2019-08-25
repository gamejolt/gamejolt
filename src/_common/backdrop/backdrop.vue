<template>
	<div
		class="backdrop"
		:class="[className, { active }]"
		@click="_clicked"
		@transitionend="_transitionend"
	></div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.backdrop
	position: absolute

	// If it's attached to the body directly (the default) just use a fixed
	// position so that it contains the whole screen.
	body > &
		position: fixed

	top: 0
	right: 0
	bottom: 0
	left: 0
	background-color: rgba($black, $backdrop-opacity)
	user-select: none
	z-index: $zindex-backdrop
	opacity: 0
	transition: opacity 300ms
	will-change: opacity

	&.active
		opacity: 1
</style>

<script lang="ts" src="./backdrop"></script>
