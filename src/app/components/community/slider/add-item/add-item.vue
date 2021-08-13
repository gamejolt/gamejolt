<script lang="ts" src="./add-item"></script>

<template>
	<div class="-item">
		<app-community-add-widget />
	</div>
</template>

<style lang="stylus" scoped>
@import '../common'
@import '~common/jolticons/jolticons'

.-item
	position: relative
	height: $-size-xs
	vertical-align: middle

	@media $media-sm-up
		height: $-size
		// Needed to counteract the height of the label the add button does not have.
		vertical-align: top

	::v-deep(.jolticon)
		@extend .jolticon-3x

	&:not(.-disabled)
		// Undoes pressy()
		transition: none !important
		transform: none !important
</style>
