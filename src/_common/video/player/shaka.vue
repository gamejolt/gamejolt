<script lang="ts" src="./shaka"></script>

<template>
	<app-video
		:player-controller="player"
		:should-play="shouldAutoplay"
		:init-callback="initShakaWithVideo"
		track-playtime
	/>
</template>
