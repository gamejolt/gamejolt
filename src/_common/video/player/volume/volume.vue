<script lang="ts" src="./volume"></script>

<template>
	<div class="-container">
		<div class="player-control-button" @click="onClickMute">
			<app-jolticon :icon="isMuted ? 'audio-mute' : 'audio'" />
		</div>

		<app-slider
			v-if="!Screen.isMobile && hasSlider"
			class="-slider"
			:percent="player.volume"
			@scrub="onVolumeScrub"
		/>
	</div>
</template>

<style lang="stylus" scoped>
@import '../common'

.-container
	display: inline-flex

.-slider
	max-width: 128px
</style>
