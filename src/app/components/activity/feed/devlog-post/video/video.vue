<script lang="ts" src="./video"></script>

<template>
	<div v-if="video.provider === 'gamejolt'" class="-spacing">
		<template v-if="!video.is_processing && video.posterMediaItem">
			<app-activity-feed-video-player
				class="-video"
				:feed-item="item"
				:manifests="video.manifestUrls"
				:media-item="video.posterMediaItem"
				@play="onVideoPlay"
				@time="onTimeChange"
			/>
		</template>
		<div v-else class="well sans-rounded fill-offset">
			<app-video-processing-progress :post="post" @complete="onProcessingComplete" />
		</div>
	</div>
	<app-activity-feed-video-embed
		v-else
		:video-id="video.video_id"
		:thumbnail="video.thumbnail_url"
		:is-hydrated="isHydrated"
	/>
</template>

<style lang="stylus" scoped>
@import '~styles/variables'
@import '../../variables'

.-spacing
	margin-left: -($grid-gutter-width-xs / 2)
	margin-right: @margin-left
	margin-top: $-item-padding-xs-v

	@media $media-sm-up
		margin-left: -($grid-gutter-width / 2) + $border-width-base
		margin-right: @margin-left
		margin-top: $-item-padding-v
</style>
