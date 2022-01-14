<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import {
	queueVideoFullscreenChange,
	trackVideoPlayerEvent,
	VideoPlayerController,
} from '../controller';

@Options({})
export default class AppVideoPlayerFullscreen extends Vue {
	@Prop({ type: Object, required: true }) player!: VideoPlayerController;

	toggleFullscreen() {
		trackVideoPlayerEvent(
			this.player,
			!this.player.isFullscreen ? 'fullscreen' : 'un-fullscreen',
			'click-control'
		);
		queueVideoFullscreenChange(this.player, !this.player.isFullscreen);
	}
}
</script>

<template>
	<div class="player-control-button" @click="toggleFullscreen">
		<app-jolticon :icon="!player.isFullscreen ? 'fullscreen' : 'unfullscreen'" />
	</div>
</template>

<style lang="stylus" scoped>
@import '../common'
</style>
