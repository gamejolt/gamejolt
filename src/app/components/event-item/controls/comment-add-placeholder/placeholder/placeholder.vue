<template>
	<div class="form-control -container" @click="onClick('')">
		<div class="-placeholder">
			<em>Leave a comment...</em>
		</div>
		<div class="-buttons" @click.stop="onClick('gif')">
			<app-jolticon icon="gif" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.-container
	height: auto
	cursor: text
	position: relative
	theme-prop('color', 'fg-muted')

.-placeholder
	padding-left: 4px
	white-space: nowrap

	@media $media-sm-up
		padding-bottom: ($grid-gutter-width / 4)
		padding-top: ($grid-gutter-width / 4)

.-buttons
	position: absolute
	right: ($grid-gutter-width / 4)
	top: 0
	height: 100%
	display: flex
	align-items: center
	cursor: pointer

	& span
		@media $media-sm-up
			font-size: 20px

</style>

<script lang="ts" src="./placeholder"></script>
