<script lang="ts" setup>
defineProps({
	/**
	 * Extends the overlay 4px past the content on the bottom, rather than being
	 * inset 4px on the bottom.
	 */
	end: { type: Boolean },
	hide: { type: Boolean },
});
</script>

<template>
	<div class="sticker-controls-overlay">
		<div v-if="!hide" class="-overlay" :class="{ '-end': end }" />
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
.sticker-controls-overlay
	position: relative
	// Needs to be higher than the z-index of AppStickerTarget
	z-index: 1

	.-overlay
		rounded-corners-lg()
		change-bg('bg')
		// We want to expand the overlay out to the edges of the post container.
		margin-left: -($grid-gutter-width-xs / 2)
		margin-right: -($grid-gutter-width-xs / 2)
		position: absolute
		top: -4px
		bottom: 4px
		left: 0
		right: @left
		opacity: 0.9
		z-index: -1

		@media $media-sm-up
			margin-left: -($grid-gutter-width / 2)
			margin-right: -($grid-gutter-width / 2)

		&.-end
			bottom: -4px
</style>
