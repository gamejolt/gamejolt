import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { number } from '../../../../../_common/filters/number';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import AppLoading from '../../../../../_common/loading/loading.vue';
import { AppFiresideContainer } from '../../container/container';
import { createFiresideController, FiresideController } from '../../controller/controller';
import AppFiresideStreamVideo from '../video/video.vue';

@Component({
	components: {
		AppLoading,
		AppFiresideStreamVideo,
		AppFiresideContainer,
	},
})
export default class AppFiresideStreamPreviewVideo extends Vue {
	@Prop({ type: Fireside, required: true })
	fireside!: Fireside;

	// Gets assigned with a real controller immediately, but needs this to not
	// break reactivity.
	c: FiresideController = null as any;
	readonly number = number;

	created() {
		this.c = createFiresideController(this.fireside, true);
	}

	get focusedUser() {
		return this.c.rtc?.focusedUser;
	}

	get hasVideo() {
		return this.focusedUser?.hasVideo === true;
	}

	get shouldShowVideo() {
		// We can only show local videos in one place at a time. This will
		// re-grab the video feed when it gets rebuilt.
		return this.hasVideo && !(this.c.isShowingStreamSetup && this.c.rtc?.isFocusingMe);
	}
}
