<script lang="ts" src="./fullscreen"></script>

<template>
	<div class="player-control-button" @click="toggleFullscreen">
		<app-jolticon :icon="!player.isFullscreen ? 'fullscreen' : 'unfullscreen'" />
	</div>
</template>

<style lang="stylus" scoped>
@import '../common'
</style>
