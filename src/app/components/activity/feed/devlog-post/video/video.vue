<script lang="ts" src="./video"></script>

<template>
	<div v-if="true">
		<!-- :max-width="mediaItem.width"
			:max-height="deviceMaxHeight" -->
		<!-- @change="onDimensionsChange" -->
		<app-responsive-dimensions :ratio="mediaItem.width / mediaItem.height">
			<app-media-item-backdrop class="-backdrop" :media-item="mediaItem">
				<!-- :style="itemStyling" -->
				<app-img-responsive
					v-if="!isFocused"
					class="-img"
					:src="mediaItem.mediaserver_url"
					alt=""
					ondragstart="return false"
				/>
				<!-- :style="itemStyling" -->
				<app-video-player
					v-else
					:poster="mediaItem.mediaserver_url"
					manifest="https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd"
					hide-scrubber
					autoplay
					@play="onVideoPlay"
				/>
			</app-media-item-backdrop>
		</app-responsive-dimensions>
	</div>
	<div v-else>
		<app-activity-feed-video-embed
			:video-id="video.video_id"
			:thumbnail="video.thumbnail_url"
			:is-hydrated="isHydrated"
			@bootstrap="$emit('content-bootstrapped')"
			@play="$emit('expanded')"
		/>
	</div>
</template>
