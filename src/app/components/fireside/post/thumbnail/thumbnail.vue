<template>
	<div class="fireside-post-thumbnail">
		<a
			class="fireside-post-thumbnail-img"
			:href="post.url"
			target="_blank"
			:style="{
				'background-image': `url('${post.header.img_url || noThumb}')`,
			}"
		></a>

		<h5 class="fireside-post-thumbnail-heading">
			<a class="link-unstyled" :href="post.url" target="_blank">
				{{ post.lead_snippet }}
			</a>
		</h5>

		<div class="fireside-post-thumbnail-byline text-muted small">
			<span class="hidden-xs">By</span>
			<a
				class="link-unstyled"
				:href="Environment.firesideBaseUrl + `/@${post.user.username}`"
				target="_blank"
			>
				@{{ post.user.username }}
			</a>
			<span class="dot-separator"></span>
			<em>
				<app-time-ago :date="post.published_on" />
			</em>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@require '~styles/variables'
@require '~styles-lib/mixins'

.fireside-post-thumbnail
	margin-bottom: $grid-gutter-width-xs

	@media $media-sm-up
		margin-bottom: $grid-gutter-width

	&-heading
		margin-top: 0
		margin-bottom: 0
		font-weight: bold

	&-img
		change-bg('bg-offset')
		position: relative
		display: block
		height: 180px
		background-repeat: no-repeat
		background-position: center center
		background-size: cover
		margin-bottom: $font-size-base

		&::before, &::after
			overlay-img()
			opacity: 0
			transition: opacity 400ms

		&::before
			background-image: linear-gradient(to right, rgba($gj-pink, 0.15) 0, rgba($gj-pink, 0) 25%)

		&::after
			background-image: linear-gradient(to right, rgba($gj-blue, 0) 75%, rgba($gj-blue, 0.15) 100%)

		&:hover
			&::before, &::after
				opacity: 1
				transition: none
</style>

<script lang="ts" src="./thumbnail"></script>
