<script lang="ts" src="./backdrop"></script>

<template>
	<div class="backdrop" :class="className" @click="onClicked" />
</template>

<style lang="stylus" scoped>
::v-global(.backdrop-active)
	overflow: hidden !important

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
</style>
