import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { assertNever } from '../../../../utils/utils';
import { propRequired } from '../../../../utils/vue';
import { toggleVideoPlayback, VideoPlayerController } from '../controller';

@Component({})
export default class AppVideoPlayerPlayback extends Vue {
	@Prop(propRequired(VideoPlayerController)) player!: VideoPlayerController;

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
	}
}
