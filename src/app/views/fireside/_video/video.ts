import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { FiresideRTC, FiresideRTCKey } from '../fireside-rtc';
import {
	deregisterVideoPlaybackElement,
	FiresideRTCUser,
	registerVideoPlaybackElement,
} from '../fireside-rtc-user';

@Component({})
export default class AppFiresideVideo extends Vue {
	@Prop({ type: FiresideRTCUser, required: true })
	rtcUser!: FiresideRTCUser;

	@Prop({ type: Boolean, required: false, default: false })
	lowBitrate!: boolean;

	@InjectReactive(FiresideRTCKey) rtc!: FiresideRTC;

	private _myRtcUser!: FiresideRTCUser;

	$el!: HTMLDivElement;

	get hasVideo() {
		return this.rtcUser.hasVideo;
	}

	get isLoadingVideo() {
		return this.hasVideo && this.rtc.videoClient?.connectionState !== 'CONNECTED';
	}

	created() {
		this._myRtcUser = this.rtcUser;
	}

	mounted() {
		registerVideoPlaybackElement(this.rtcUser, this.$el, this.lowBitrate);
	}

	beforeDestroy() {
		deregisterVideoPlaybackElement(this._myRtcUser, this.$el);
	}
}
