import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import { number } from '../../../../../_common/filters/number';
import { Fireside } from '../../../../../_common/fireside/fireside.model';
import AppLoading from '../../../../../_common/loading/loading.vue';
import AppFiresideVideo from '../../../../views/fireside/_video/video.vue';
import { AppFiresideContainer } from '../../container/container';
import { createFiresideController, FiresideController } from '../../controller/controller';

@Component({
	components: {
		AppLoading,
		AppFiresideVideo,
		AppFiresideContainer,
	},
})
export default class AppFiresideStreamBannerVideo extends Vue {
	@Prop({ type: Fireside, required: true })
	fireside!: Fireside;

	c!: FiresideController;
	readonly number = number;

	created() {
		this.c = createFiresideController(this.fireside, true);
	}

	get shouldShowStream() {
		return this.c.rtc && this.c.rtc.users.some(user => user.hasVideo);
	}

	get shouldShowVideo() {
		// We can only show local videos in one place at a time. This will
		// re-grab the video feed when it gets rebuilt.
		return !(this.c.isShowingStreamSetup && this.c.rtc?.isFocusingMe);
	}

	get memberCount() {
		return this.c.chatUsers?.count ?? 0;
	}

	get focusedUser() {
		return this.c.rtc?.focusedUser;
	}

	get videoPaused() {
		return this.c.rtc?.videoPaused;
	}

	get hasVideo() {
		return this.focusedUser?.hasVideo === true;
	}

	get isLoadingVideo() {
		return this.hasVideo && this.c.rtc?.videoChannel.isConnected !== true;
	}
}
