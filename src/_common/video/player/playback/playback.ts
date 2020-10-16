import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { toggleVideoPlayback, VideoPlayerController } from '../controller';

@Component({})
export default class AppVideoPlayerPlayback extends Vue {
	@Prop(propRequired(VideoPlayerController)) player!: VideoPlayerController;

	get icon() {
		return this.player.isPaused ? 'play' : 'pause';
	}

	onClickPlayback() {
		toggleVideoPlayback(this.player);
	}
}
