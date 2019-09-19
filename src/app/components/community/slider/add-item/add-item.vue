<template>
	<div class="-item">
		<app-community-add-widget v-app-tooltip.bottom="$gettext(`Create a Community`)" />
	</div>
</template>

<style lang="stylus" scoped>
@require '~common/jolticons/jolticons'
@require '../common'

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
</style>

<script lang="ts" src="./add-item"></script>
