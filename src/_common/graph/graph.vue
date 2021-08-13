<script lang="ts" src="./graph"></script>

<template>
	<div
		class="graph full-bleed-xs"
		:class="['graph-' + type, backgroundVariant ? 'graph-background-variant' : '']"
	>
		<div class="chart">
			<canvas ref="canvas" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.graph
	padding: ($grid-gutter-width-xs / 2)
	margin-bottom: $line-height-computed

	@media $media-sm-up
		padding: 10px

.graph-background-variant
	background-color: inherit !important

@import './line'
@import './pie'
</style>
