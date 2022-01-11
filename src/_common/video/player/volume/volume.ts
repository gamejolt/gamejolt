import { Options, Prop, Vue } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../utils/vue';
import AppPopper from '../../../popper/popper.vue';
import { Screen } from '../../../screen/screen-service';
import {
	SettingVideoPlayerFeedMuted,
	SettingVideoPlayerMuted,
} from '../../../settings/settings.service';
import { ScrubberCallback } from '../../../slider/slider';
import AppSlider from '../../../slider/slider.vue';
import { AppTooltip } from '../../../tooltip/tooltip-directive';
import {
	scrubVideoVolume,
	setVideoMuted,
	trackVideoPlayerEvent,
	VideoPlayerController,
} from '../controller';

@Options({
	components: {
		AppPopper,
		AppSlider,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppPlayerVolume extends Vue {
	@Prop(propRequired(Object)) player!: VideoPlayerController;
	@Prop(propOptional(Boolean, false)) hasSlider!: boolean;

	readonly Screen = Screen;

	get isMuted() {
		if (this.player.altControlsBehavior) {
			return this.player.muted;
		} else {
			return this.player.volume === 0;
		}
	}

	onClickMute() {
		let currentState = true;
		if (this.player.context == 'feed') {
			currentState = SettingVideoPlayerFeedMuted.get();
		} else if (this.player.context == 'page') {
			currentState = SettingVideoPlayerMuted.get();
		}

		setVideoMuted(this.player, !currentState);
		trackVideoPlayerEvent(
			this.player,
			!this.player.volume || this.player.muted ? 'mute' : 'unmute',
			'click-control'
		);
	}

	onVolumeScrub({ percent, stage }: ScrubberCallback) {
		scrubVideoVolume(this.player, percent, stage);
	}
}
