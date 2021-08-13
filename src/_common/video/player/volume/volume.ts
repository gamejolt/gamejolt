import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../utils/vue';
import AppPopper from '../../../popper/popper.vue';
import { Screen } from '../../../screen/screen-service';
import {
	SettingVideoPlayerFeedMuted,
	SettingVideoPlayerMuted,
} from '../../../settings/settings.service';
import { AppTooltip } from '../../../tooltip/tooltip-directive';
import { setVideoMuted, trackVideoPlayerEvent, VideoPlayerController } from '../controller';
import AppPlayerSlider from '../slider/slider.vue';

@Component({
	components: {
		AppPopper,
		AppPlayerSlider,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppPlayerVolume extends Vue {
	@Prop(propRequired(VideoPlayerController)) player!: VideoPlayerController;
	@Prop(propOptional(Boolean, false)) hasSlider!: boolean;

	readonly Screen = Screen;

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

	get isMuted() {
		if (this.player.altControlsBehavior) {
			return this.player.muted;
		} else {
			return this.player.volume === 0;
		}
	}
}
