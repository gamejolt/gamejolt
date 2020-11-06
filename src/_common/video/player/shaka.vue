<script lang="ts" src="./shaka"></script>

<template>
	<app-video
		:inherited-player="player"
		:should-play="shouldAutoplay"
		:init-callback="initShakaWithVideo"
		:player-context="player.context"
	/>
</template>
