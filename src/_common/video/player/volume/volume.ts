import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import AppPopper from '../../../popper/popper.vue';
import { Screen } from '../../../screen/screen-service';
import { AppTooltip } from '../../../tooltip/tooltip-directive';
import { VideoPlayerController } from '../controller';
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

	readonly Screen = Screen;

	onClickMute() {
		// JODO: implement mute
		console.log('toggle mute');
	}
}
