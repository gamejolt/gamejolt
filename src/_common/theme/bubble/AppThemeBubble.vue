<script lang="ts" setup>
defineProps({
	highlight: {
		type: String,
		default: undefined,
	},
	backlight: {
		type: String,
		default: undefined,
	},
	active: {
		type: Boolean,
	},
});
</script>

<template>
	<div
		class="theme-bubble"
		:class="{
			'-active': active,
		}"
	>
		<span v-if="highlight" class="-highlight" :style="{ backgroundColor: '#' + highlight }" />
		<span v-if="backlight" class="-backlight" :style="{ backgroundColor: '#' + backlight }" />
	</div>
</template>

<style lang="stylus" scoped>
::v-global(a .theme-bubble)
	cursor: pointer

::v-global(a .theme-bubble:hover)
	box-shadow: 0 0 0 2px var(--theme-bg), 0 0 0 4px var(--theme-fg)

.theme-bubble
	img-circle()
	position: relative
	padding-top: 100%
	height: 0
	overflow: hidden
	// Checkerboard pattern
	background-image: linear-gradient(45deg, #808080 25%, transparent 25%), linear-gradient(-45deg, #808080 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #808080 75%), linear-gradient(-45deg, transparent 75%, #808080 75%)
	background-size: 10px 10px
	background-position: 0 0, 0 5px, 5px -5px, -5px 0

.-active
	box-shadow: 0 0 0 2px var(--theme-bg), 0 0 0 4px var(--theme-link)

.-highlight
.-backlight
	position: absolute
	width: 150%
	height: 150%

.-highlight
	top: 0
	left: 0
	z-index: 1

.-backlight
	bottom: -75%
	right: -75%
	transform: rotateZ(45deg)
	z-index: 2
</style>
