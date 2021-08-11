import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { FiresideRTC, FiresideRTCKey } from '../fireside-rtc';
import {
	FiresideRTCUser,
	FiresideVideoLock,
	FiresideVideoPlayStatePlaying,
	getVideoLock,
	releaseVideoLock,
	setVideoPlayback,
} from '../fireside-rtc-user';

@Component({})
export default class AppFiresideVideo extends Vue {
	@Prop({ type: FiresideRTCUser, required: true })
	rtcUser!: FiresideRTCUser;

	@Prop({ type: Boolean, required: false, default: false })
	lowBitrate!: boolean;

	@InjectReactive(FiresideRTCKey) rtc!: FiresideRTC;

	private _myRtcUser!: FiresideRTCUser;
	private _videoLock: FiresideVideoLock | null = null;

	declare $el: HTMLDivElement;

	get hasVideo() {
		return this._myRtcUser.hasVideo;
	}

	get isLoadingVideo() {
		return this.hasVideo && this.rtc.videoClient?.connectionState !== 'CONNECTED';
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
