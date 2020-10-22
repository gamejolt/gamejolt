<script lang="ts" src="./video"></script>

<template>
	<div v-if="video.provider === 'gamejolt'" class="-responsive">
		<app-responsive-dimensions
			v-if="video.posterMediaItem"
			:ratio="video.posterMediaItem.width / video.posterMediaItem.height"
		>
			<app-activity-feed-video-player
				:is-focused="isFocused"
				:poster="video.posterUrl"
				:manifests="video.manifestUrls"
				@play="onVideoPlay"
				@click-video-player="emitClickVideoPlayer"
			/>
		</app-responsive-dimensions>
		<template v-else>
			<!-- JODO: Placeholder? -->
		</template>
	</div>
	<app-activity-feed-video-embed
		v-else
		:video-id="video.video_id"
		:thumbnail="video.thumbnail_url"
		:is-hydrated="isHydrated"
		@bootstrap="emitContentBootstrapped()"
	/>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'

.-responsive
	margin-left: -($grid-gutter-width-xs / 2)
	margin-right: @margin-left

	@media $media-sm-up
		margin-left: -($grid-gutter-width / 2) + $border-width-base
		margin-right: @margin-left
</style>
