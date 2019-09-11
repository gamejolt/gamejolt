<template>
	<div
		class="graph full-bleed-xs"
		:class="['graph-' + type, backgroundVariant ? 'graph-background-variant' : '']"
	>
		<div class="chart">
			<canvas ref="canvas"></canvas>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'

.graph
	padding: ($grid-gutter-width-xs / 2)
	margin-bottom: $line-height-computed

	@media $media-sm-up
		padding: 10px

.graph-background-variant
	background-color: inherit !important

@require './line'
@require './pie'
</style>

<script lang="ts" src="./graph"></script>
