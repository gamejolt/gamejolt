<template>
	<div class="-item" :style="{ width, height }">
		<div class="-controls theme-dark">
			<app-button icon="remove" overlay sparse @click.prevent="emitRemove()" />
		</div>

		<app-img-responsive :src="item.mediaserver_url" alt="" />
	</div>
</template>

<style lang="stylus" scoped>
@require '../variables'
@require '~styles-lib/mixins'

.-item
	rounded-corners()
	change-bg('bg-subtle')
	position: relative
	display: inline-block
	vertical-align: top
	cursor: move
	// Spacing through margins.
	margin-right: $-padding

	&:last-child
		margin-right: 0

	img
		rounded-corners()
		z-index: 1

.-controls
	position: absolute
	top: 3px
	right: 3px
	z-index: 2
</style>

<script lang="ts" src="./item"></script>
