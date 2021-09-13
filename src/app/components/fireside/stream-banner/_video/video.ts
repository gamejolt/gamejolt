import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { number } from '../../../../../_common/filters/number';
import { FiresideRTCUser } from '../../../../../_common/fireside/rtc/user';
import AppLoading from '../../../../../_common/loading/loading.vue';
import AppFiresideDesktopAudio from '../../../../views/fireside/_desktop-audio/desktop-audio.vue';
import AppFiresideHostList from '../../../../views/fireside/_host-list/host-list.vue';
import AppFiresideHostThumbIndicator from '../../../../views/fireside/_host-thumb/host-thumb-indicator.vue';
import AppFiresideVideoStats from '../../../../views/fireside/_video-stats/video-stats.vue';
import AppFiresideVideo from '../../../../views/fireside/_video/video.vue';
import {
	FiresideController,
	FiresideControllerKey,
	getFiresideLink,
} from '../../controller/controller';

@Component({
	components: {
		AppFiresideHostList,
		AppFiresideHostThumbIndicator,
		AppLoading,
		AppFiresideVideo,
		AppFiresideDesktopAudio,
		AppFiresideVideoStats,
	},
})
export default class AppFiresideStreamBannerVideo extends Vue {
	@Prop({ type: FiresideRTCUser, required: true })
	rtcUser!: FiresideRTCUser;

	@InjectReactive(FiresideControllerKey) c!: FiresideController;

	readonly Screen = Screen;
	readonly number = number;

	get url() {
		return getFiresideLink(this.c, this.$router);
	}

	get shouldShowVideo() {
		// We can only show local videos in one place at a time. This will
		// re-grab the video feed when it gets rebuilt.
		return !(this.c.isShowingStreamSetup && this.c.rtc?.isFocusingMe);
	}

	get memberCount() {
		return this.c.chatUsers?.count ?? 0;
	}

	get videoPaused() {
		return this.c.rtc?.videoPaused;
	}

	get hasVideo() {
		return this.rtcUser.hasVideo;
	}

	get isLoadingVideo() {
		return this.hasVideo && this.c.rtc?.videoChannel.isConnected !== true;
	}
}
