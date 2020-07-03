<template>
	<div class="event-item-controls-overlay">
		<div class="-overlay" :class="{ '-end': end }" />
		<slot />
	</div>
</template>

<script lang="ts" src="./controls-overlay"></script>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.event-item-controls-overlay
	position: relative
	// Needs to be higher than the z-index of AppStickerTarget
	z-index: 1

	.-overlay
		change-bg('bg')
		position: absolute
		top: -4px
		right: 0
		bottom: 4px
		left: 0
		opacity: 0.9
		z-index: -1
		// We want to expand the overlay out to the edges of the post container.
		margin-left: -($grid-gutter-width-xs / 2)
		margin-right: -($grid-gutter-width-xs / 2)

		@media $media-sm-up
			margin-left: -($grid-gutter-width / 2) + $border-width-base + 0.5px
			margin-right: -($grid-gutter-width / 2) + $border-width-base + 0.5px

		&.-end
			bottom: -4px
</style>
