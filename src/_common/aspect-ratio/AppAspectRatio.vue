<script lang="ts" setup>
/**
 * Used to create a box that takes the full-width of its parent and sizes its
 * height based on a ratio from that.
 *
 * Since the aspect-ratio CSS property doesn't work on older browsers, we have
 * to do some stupid hacks to get this working.
 */

defineProps({
	ratio: {
		type: Number,
		required: true,
	},
	showOverflow: {
		type: Boolean,
	},
});
</script>

<template>
	<div
		class="-outer"
		:style="{
			'padding-top': `${100 / ratio}%`,
			overflow: !showOverflow ? 'hidden' : undefined,
		}"
	>
		<div class="-inner">
			<slot />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
.-outer
	position: relative
	height: 0

.-inner
	position: absolute
	top: 0
	left: 0
	width: 100%
	height: 100%
</style>
