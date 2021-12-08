import Vue from 'vue';
import { Component, InjectReactive } from 'vue-property-decorator';
import {
	FiresideController,
	FiresideControllerKey,
} from '../../../components/fireside/controller/controller';

@Component({})
export default class AppFiresideStreamPlayback extends Vue {
	@InjectReactive(FiresideControllerKey)
	c!: FiresideController;

	get videoPaused() {
		return this.c.rtc?.videoPaused == true;
	}

	togglePlayback() {
		if (this.videoPaused) {
			this.pauseVideo();
		} else {
			this.unpauseVideo();
		}
	}

	private pauseVideo() {
		this.c.rtc!.videoPaused = false;
	}

	private unpauseVideo() {
		this.c.rtc!.videoPaused = true;
	}
}
