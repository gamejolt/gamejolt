import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import {
	FiresideRTCUser,
	startDesktopAudioPlayback,
	stopDesktopAudioPlayback,
} from '../../../../_common/fireside/rtc/user';
import {
	FiresideController,
	FiresideControllerKey,
	setFocusedDesktopVolume,
} from '../controller/controller';

@Component({})
export default class AppFiresideDesktopAudio extends Vue {
	@Prop({ type: FiresideRTCUser, required: true })
	rtcUser!: FiresideRTCUser;

	@InjectReactive(FiresideControllerKey) c!: FiresideController;

	private _myRtcUser!: FiresideRTCUser;

	created() {
		this._myRtcUser = this.rtcUser;
	}

	async mounted() {
		await startDesktopAudioPlayback(this.rtcUser);
		setFocusedDesktopVolume(this.c, this.c.desktopVolume);
	}

	beforeDestroy() {
		stopDesktopAudioPlayback(this._myRtcUser);
	}
}
