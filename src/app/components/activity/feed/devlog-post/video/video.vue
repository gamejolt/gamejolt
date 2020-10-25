<script lang="ts" src="./video"></script>

<template>
	<div v-if="video.provider === 'gamejolt'" class="-responsive">
		<app-responsive-dimensions
			v-if="!video.is_processing && video.posterMediaItem"
			class="-video-container"
			:ratio="video.posterMediaItem.width / video.posterMediaItem.height"
			:max-height="maxPlayerHeight"
			@change="onChangeDimensions"
		>
			<div class="-content-container">
				<app-activity-feed-video-player
					v-if="shouldLoadVideo"
					class="-video"
					:manifests="video.manifestUrls"
					@play="onVideoPlay"
					@time="onTimeChange"
				/>

				<!--
				This will show behind the video so that we can switch to it while
				the video is loading and when it's unfocused/not active.
				-->
				<app-media-item-backdrop class="-backdrop" :media-item="video.posterMediaItem">
					<div class="-border" />
					<app-img-responsive
						class="-img"
						:src="video.posterMediaItem.mediaserver_url"
						:style="{ height, width }"
						alt=""
					/>
					<div class="-border" />
				</app-media-item-backdrop>
			</div>
		</app-responsive-dimensions>
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

.-responsive
	display: flex
	margin-left: -($grid-gutter-width-xs / 2)
	margin-right: @margin-left
	margin-top: $-item-padding-xs-v

	@media $media-sm-up
		margin-left: -($grid-gutter-width / 2) + $border-width-base
		margin-right: @margin-left
		margin-top: $-item-padding-v

.-video-container
	position: relative
	// Overrides the 'width' styling, allowing us to add borders to the sides of videos and image placeholders.
	min-width: 100%

.-content-container
	height: 100%

.-video
	z-index: 1

.-backdrop
	display: flex
	position: absolute
	top: 0
	left: 0
	z-index: 0

.-border
	flex: auto
	background-color: $black

.-img
	max-height: 100%
</style>
