<script lang="ts" src="./placement-mask-item"></script>

<template>
	<rect :class="classes" :x="x" :y="y" :width="width" :height="height" rx="8" />
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.-mask
	fill: black

.-rect
	stroke-width: 2
	stroke: var(--theme-link-hover)
	stroke-dasharray: 4
	fill: transparent

	&-hovered
		stroke: var(--theme-link)
		stroke-dasharray: none
</style>
