<template>
	<div class="tooltip">
		<div class="tooltip-inner">
			{{ text }}
		</div>
	</div>
</template>

<script lang="ts" src="./tooltip"></script>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.tooltip
	position: absolute
	display: block !important
	padding: 4px
	font-size: $tooltip-font-size
	line-height: 1.4
	z-index: $zindex-tooltip
	pointer-events: none

	.tooltip-inner
		rounded-corners()
		max-width: $tooltip-max-width
		padding: 5px 8px
		text-align: center
		color: $tooltip-color
		background-color: $tooltip-bg

	&.-hide
		opacity: 0
		visibility: none
		transition: opacity 200ms, visibility 200ms
</style>
