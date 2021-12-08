<script lang="ts" src="./stream-playback"></script>

<template>
	<div class="-options-wrap" @click.capture.stop="togglePlayback">
		<div class="-options">
			<app-jolticon class="-icon" :icon="videoPaused ? 'play' : 'pause'" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../common'
</style>
