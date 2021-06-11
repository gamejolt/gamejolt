<script lang="ts" src="./volume"></script>

<template>
	<div class="-container">
		<div class="player-control-button" @click="onClickMute">
			<app-jolticon :icon="player.volume === 0 || player.muted ? 'audio-mute' : 'audio'" />
		</div>

		<app-player-slider v-if="!Screen.isMobile && hasSlider" :player="player" />
	</div>
</template>

<style lang="stylus" scoped>
@import '../common'

.-container
	display: inline-flex
</style>
