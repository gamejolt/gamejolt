import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { FiresideRTC, FiresideRTCKey } from '../fireside-rtc';
import {
	FiresideRTCUser,
	startDesktopAudioPlayback,
	stopDesktopAudioPlayback,
} from '../fireside-rtc-user';

@Component({})
export default class AppFiresideDesktopAudio extends Vue {
	@Prop({ type: FiresideRTCUser, required: true })
	rtcUser!: FiresideRTCUser;

	@InjectReactive(FiresideRTCKey) rtc!: FiresideRTC;

	private _myRtcUser!: FiresideRTCUser;

	created() {
		// 10x hack to keep the reference around for when the component gets destroyed.
		this._myRtcUser = this.rtcUser;
	}

	mounted() {
		startDesktopAudioPlayback(this.rtcUser);
	}

	beforeDestroy() {
		stopDesktopAudioPlayback(this._myRtcUser);
	}
}
