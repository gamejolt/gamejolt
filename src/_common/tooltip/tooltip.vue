<script lang="ts" src="./tooltip"></script>

<template>
	<div v-if="tooltip" class="tooltip" :class="{ '-hide': !tooltip.isActive || !tooltip.text }">
		<div v-if="tooltip.text" class="tooltip-inner">
			{{ tooltip.text }}
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.tooltip
	position: absolute
	top: 0
	display: block !important
	padding: 4px
	font-size: $tooltip-font-size
	line-height: 1.4
	z-index: $zindex-tooltip
	pointer-events: none
	transition: opacity 200ms, visibility 200ms

	&-inner
		rounded-corners()
		max-width: $tooltip-max-width
		padding: 5px 8px
		text-align: center
		color: $tooltip-color
		background-color: $tooltip-bg

	&.-hide
	&[data-popper-reference-hidden]
		opacity: 0
		visibility: hidden
</style>
