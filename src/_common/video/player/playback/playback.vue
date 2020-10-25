<script lang="ts" src="./playback"></script>

<template>
	<div class="player-control-button" @click.capture.prevent="onClickPlayback">
		<app-jolticon :icon="icon" />
	</div>
</template>

<style lang="stylus" scoped>
@import '../common'
</style>
