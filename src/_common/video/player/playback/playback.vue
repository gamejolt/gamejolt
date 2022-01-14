<script lang="ts">
import { Options, Prop, Vue } from 'vue-property-decorator';
import { assertNever } from '../../../../utils/utils';
import { toggleVideoPlayback, trackVideoPlayerEvent, VideoPlayerController } from '../controller';

@Options({})
export default class AppVideoPlayerPlayback extends Vue {
	@Prop({ type: Object, required: true }) player!: VideoPlayerController;

	get icon() {
		switch (this.player.state) {
			case 'playing':
				return 'pause';
			case 'paused':
				return 'play';
			default:
				assertNever(this.player.state);
		}
	}

	onClickPlayback() {
		toggleVideoPlayback(this.player);
		trackVideoPlayerEvent(
			this.player,
			this.player.state === 'playing' ? 'play' : 'pause',
			'click-control'
		);
	}
}
</script>

<template>
	<div class="player-control-button" @click.capture.prevent="onClickPlayback">
		<app-jolticon :icon="icon" />
	</div>
</template>

<style lang="stylus" scoped>
@import '../common'
</style>
