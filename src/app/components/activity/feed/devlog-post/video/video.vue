<script lang="ts" src="./video"></script>

<template>
	<app-activity-feed-video-player
		v-if="video.provider === 'gamejolt'"
		:is-focused="isFocused"
		:poster="video.posterUrl"
		:manifests="video.manifestUrls"
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
