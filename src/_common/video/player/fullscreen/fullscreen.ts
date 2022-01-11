import { Options, Prop, Vue } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import {
	queueVideoFullscreenChange,
	trackVideoPlayerEvent,
	VideoPlayerController,
} from '../controller';

@Options({})
export default class AppVideoPlayerFullscreen extends Vue {
	@Prop(propRequired(Object)) player!: VideoPlayerController;

	toggleFullscreen() {
		trackVideoPlayerEvent(
			this.player,
			!this.player.isFullscreen ? 'fullscreen' : 'un-fullscreen',
			'click-control'
		);
		queueVideoFullscreenChange(this.player, !this.player.isFullscreen);
	}
}
