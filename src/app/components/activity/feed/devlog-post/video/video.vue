<script lang="ts" src="./video"></script>

<template>
	<div v-if="video.provider === 'gamejolt'" class="-responsive">
		<app-responsive-dimensions
			v-if="video.posterMediaItem"
			class="-video-container"
			:ratio="video.posterMediaItem.width / video.posterMediaItem.height"
		>
			<app-activity-feed-video-player
				v-if="isFocused"
				class="-video"
				:poster="video.posterUrl"
				:manifests="video.manifestUrls"
				@play="onVideoPlay"
				@click-video-player="emitClickVideoPlayer"
			/>

			<!--
			This will show behind the video so that we can switch to it while
			the video is loading and when it's unfocused/not active.
			-->
			<app-media-item-backdrop class="-backdrop" :media-item="video.posterMediaItem">
				<app-img-responsive
					class="-img"
					:src="video.posterMediaItem.mediaserver_url"
					alt=""
				/>
			</app-media-item-backdrop>
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

.-video-container
	position: relative

.-video
	z-index: 1

.-backdrop
	position: absolute
	top: 0
	left: 0
	z-index: 0
</style>
