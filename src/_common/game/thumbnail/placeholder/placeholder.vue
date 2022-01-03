<script lang="ts" src="./placeholder"></script>

<template>
	<div class="game-thumbnail-placeholder">
		<div class="placeholder-thumb" />

		<div class="placeholder-meta">
			<div class="placeholder-avatar" />
			<div class="placeholder-dev" />
			<div class="placeholder-title" />
			<div class="placeholder-meta-extra">
				<div class="placeholder-tags" />
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../variables'

.game-thumbnail-placeholder
	margin-bottom: $grid-gutter-width-xs

	@media $media-sm-up
		margin-bottom: $grid-gutter-width

.placeholder
	&-thumb
		rounded-corners-lg()
		change-bg('bg-subtle')
		height: 0
		padding-top: 56.25% // HD 16:9

	&-meta
		position: relative
		padding-top: 10px

	&-avatar
		img-circle()
		change-bg('bg-subtle')
		float: left
		width: $game-thumbnail-avatar-size
		height: $game-thumbnail-avatar-size

	&-dev
		lazy-placeholder-block()
		margin-left: $game-thumbnail-avatar-size + $game-thumbnail-meta-spacing
		width: 40%
		height: $font-size-h6

	&-title
		lazy-placeholder-block()
		margin-top: 6px
		margin-left: $game-thumbnail-avatar-size + $game-thumbnail-meta-spacing
		width: 60%

	&-meta-extra
		clear: both
		margin-top: $game-thumbnail-meta-spacing

	&-tags
		lazy-placeholder-inline()
		rounded-corners()
		width: 60px
</style>
