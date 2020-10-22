<script lang="ts" src="./video"></script>

<template>
	<app-activity-feed-video-player
		v-if="video.provider === 'gamejolt'"
		:is-focused="isFocused"
		poster="https://m.gjcdn.net/fireside-post-image/900/4300116-ll-zd9ds2jh-v4.webp"
		manifest="https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd"
		@play="onVideoPlay"
		@click-video-player="emitClickVideoPlayer"
	/>
	<app-activity-feed-video-embed
		v-else
		:video-id="video.video_id"
		:thumbnail="video.thumbnail_url"
		:is-hydrated="isHydrated"
		@bootstrap="$emit('content-bootstrapped')"
	/>
</template>
