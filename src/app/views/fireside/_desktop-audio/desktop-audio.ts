import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { FiresideRTC, FiresideRTCKey } from '../../../../_common/fireside/rtc/rtc';
import {
	FiresideRTCUser,
	startDesktopAudioPlayback,
	stopDesktopAudioPlayback,
} from '../../../../_common/fireside/rtc/user';

@Component({})
export default class AppFiresideDesktopAudio extends Vue {
	@Prop({ type: FiresideRTCUser, required: true })
	rtcUser!: FiresideRTCUser;

	@InjectReactive(FiresideRTCKey) rtc!: FiresideRTC;

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
