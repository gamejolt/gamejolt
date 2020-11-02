<script lang="ts" src="./controls-overlay"></script>

<template>
	<div class="sticker-controls-overlay">
		<div class="-overlay" :class="{ '-end': end }" />
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.sticker-controls-overlay
	position: relative
	// Needs to be higher than the z-index of AppStickerTarget
	z-index: 1

	.-overlay
		change-bg('bg')
		// We want to expand the overlay out to the edges of the post container.
		margin-left: -($grid-gutter-width-xs / 2)
		margin-right: -($grid-gutter-width-xs / 2)
		position: absolute
		top: -4px
		bottom: 4px
		// Bleed a little bit extra to account for any invisible borders.
		left: -4px
		right: @left
		opacity: 0.9
		z-index: -1

		@media $media-sm-up
			margin-left: -($grid-gutter-width / 2) + $border-width-base + 0.5px
			margin-right: -($grid-gutter-width / 2) + $border-width-base + 0.5px

		&.-end
			bottom: -4px
</style>
