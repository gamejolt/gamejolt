<script lang="ts" src="./shaka"></script>

<template>
	<app-video
		:player="player"
		:should-play="shouldAutoplay"
		:init-callback="initShakaWithVideo"
		track-playtime
		:allow-degraded-autoplay="allowDegradedAutoplay"
	/>
</template>
