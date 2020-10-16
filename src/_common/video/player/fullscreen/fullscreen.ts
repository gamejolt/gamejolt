import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { queueVideoFullscreenChange, VideoPlayerController } from '../controller';

@Component({})
export default class AppVideoPlayerFullscreen extends Vue {
	@Prop(propRequired(VideoPlayerController)) player!: VideoPlayerController;

	toggleFullscreen() {
		queueVideoFullscreenChange(this.player, !this.player.isFullscreen);
	}
}
