import Vue from 'vue';
import { Component, Inject, Prop } from 'vue-property-decorator';
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

	@Inject({ from: FiresideRTCKey })
	rtc!: FiresideRTC;

	private _myRtcUser!: FiresideRTCUser;

	created() {
		this._myRtcUser = this.rtcUser;
	}

	mounted() {
		startDesktopAudioPlayback(this.rtcUser);
	}

	beforeDestroy() {
		stopDesktopAudioPlayback(this._myRtcUser);
	}
}
