<template>
	<div class="media-item-backdrop" :class="radiusClass">
		<div class="-color" :class="radiusClass" :style="wrapperStyling" />
		<slot />
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'


.media-item-backdrop
	position: relative
	z-index: 0
	display: flex
	overflow: hidden
	width: 100%
	height: 100%

	.-color
		position: absolute
		z-index: -1
		top: 1px
		right: 1px
		bottom: 1px
		left: 1px
		width: auto

	&.-sm, .-color.-sm
		rounded-corners-sm()

	&.-md, .-color.-md
		rounded-corners()

	&.-lg, .-color.-lg
		rounded-corners-lg()

	&.-full, .-color.-full
		img-circle()

</style>

<script lang="ts" src="./backdrop"></script>
