import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propOptional, propRequired } from '../../../../utils/vue';
import AppPopper from '../../../popper/popper.vue';
import { Screen } from '../../../screen/screen-service';
import { AppTooltip } from '../../../tooltip/tooltip-directive';
import { setVideoVolume, VideoPlayerController } from '../controller';
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
		if (this.player.volume > 0) {
			setVideoVolume(this.player, 0);
		} else {
			setVideoVolume(this.player, 100);
		}
	}
}
