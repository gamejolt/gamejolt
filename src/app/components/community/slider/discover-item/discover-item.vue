<template>
	<div class="-item">
		<app-community-discover-widget />
	</div>
</template>

<style lang="stylus" scoped>
@require '../common'
@require '~common/jolticons/jolticons'

.-item
	position: relative
	height: $-size-xs
	vertical-align: middle

	@media $media-sm-up
		height: $-size
		// Needed to counteract the height of the label the add button does not have.
		vertical-align: top

	>>> .jolticon
		@extend .jolticon-3x

		@media $media-mobile
			// @extend .jolticon-2x
			// extend doesn't work for some reason in media queries..
			margin: 0 4px
			font-size: $jolticon-size * 2

	// Undoes pressy()
	transition: none !important
	transform: none !important
</style>

<script lang="ts" src="./discover-item"></script>
