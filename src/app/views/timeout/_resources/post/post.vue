<script lang="ts" src="./post"></script>

<template>
	<div class="-post">
		<div v-if="post.hasMedia" :key="`media-${post.id}`" class="-media-items">
			<div v-for="item of [post.media[0]]" :key="item.id">
				<app-media-item-post class="-media-item" :media-item="item" is-active />
				<br />
			</div>
		</div>
		<app-content-viewer :source="post.lead_content" />
	</div>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '~styles-lib/mixins'

.-post
	max-width: 400px

.-media-items
	full-bleed-xs()

	@media $media-md-up
		margin-left: -50px
		margin-right: -50px

.-media-item
	position: relative
	margin-left: auto
	margin-right: auto
</style>
