<template>
	<app-activity-feed-video
		:video-id="video.video_id"
		:thumbnail="video.thumbnail_url"
		:is-hydrated="isHydrated"
		@bootstrap="$emit('content-bootstrapped')"
		@play="$emit('expanded')"
	/>
</template>

<script lang="ts" src="./video" />
