<script lang="ts" src="./placement-mask-target"></script>

<template>
	<div class="-target" :class="{ '-hovered': layer.hoveredTarget === target }" :style="styles" />
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-target
	rounded-corners-lg()
	position: absolute
	top: 0
	left: 0
	border-width: $border-width-large
	border-color: var(--theme-link-hover)
	border-style: dashed
	background-color: transparent

.-hovered
	border-color: var(--theme-link)
	border-style: solid
</style>
