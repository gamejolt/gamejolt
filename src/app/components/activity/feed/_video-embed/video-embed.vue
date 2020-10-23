<script lang="ts" src="./video-embed"></script>

<template>
	<div class="-video-embed">
		<app-responsive-dimensions :ratio="16 / 9">
			<app-video-embed v-if="isHydrated" video-provider="youtube" :video-id="videoId" />
		</app-responsive-dimensions>
	</div>
</template>

<style lang="stylus" scoped>
@import '../variables'
@import '~styles-lib/mixins'

.-video-embed
	change-bg('bg-offset')
	margin-top: $-item-padding-xs-v
	margin-left: -($-item-padding-xs)
	margin-right: -($-item-padding-xs)

	@media $media-sm-up
		margin-top: $-item-padding-v
		margin-left: -($-item-padding-container)
		margin-right: -($-item-padding-container)
</style>
