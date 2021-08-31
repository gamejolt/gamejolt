import Vue from 'vue';
import { Component, Prop } from 'vue-property-decorator';
import {
	FiresideRTCUser,
	startDesktopAudioPlayback,
	stopDesktopAudioPlayback,
} from '../../../../_common/fireside/rtc/user';

@Component({})
export default class AppFiresideDesktopAudio extends Vue {
	@Prop({ type: FiresideRTCUser, required: true })
	rtcUser!: FiresideRTCUser;

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
