<template>
	<div class="form-control -container" @click="onClick">
		<div class="-placeholder">
			<em>Leave a comment...</em>
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
	padding-bottom: ($grid-gutter-width / 10)
	padding-top: ($grid-gutter-width / 10)

</style>

<script lang="ts" src="./placeholder"></script>
