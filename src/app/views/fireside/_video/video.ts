import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import {
	FiresideRTCUser,
	FiresideVideoLock,
	FiresideVideoPlayStatePlaying,
	getVideoLock,
	releaseVideoLock,
	setVideoPlayback,
} from '../../../../_common/fireside/rtc/user';
import { FiresideController, FiresideControllerKey } from '../controller/controller';

@Component({})
export default class AppFiresideVideo extends Vue {
	@Prop({ type: FiresideRTCUser, required: true })
	rtcUser!: FiresideRTCUser;

	@Prop({ type: Boolean, required: false, default: false })
	lowBitrate!: boolean;

	@InjectReactive(FiresideControllerKey) c!: FiresideController;

	private _myRtcUser!: FiresideRTCUser;
	private _videoLock: FiresideVideoLock | null = null;

	$el!: HTMLDivElement;

	get hasVideo() {
		return this._myRtcUser.hasVideo;
	}

	get isLoadingVideo() {
		return this.hasVideo && this.c.rtc?.videoClient?.connectionState !== 'CONNECTED';
	}

	created() {
		this._myRtcUser = this.rtcUser;
	}

	mounted() {
		this._videoLock = getVideoLock(this._myRtcUser);
		setVideoPlayback(
			this._myRtcUser,
			new FiresideVideoPlayStatePlaying(this.$el, this.lowBitrate)
		);
	}

	destroyed() {
		// We want to give a new lock some time to get acquired before shutting
		// the stream down.
		setTimeout(() => {
			if (this._videoLock) {
				releaseVideoLock(this._myRtcUser, this._videoLock);
			}
		}, 0);
	}
}
