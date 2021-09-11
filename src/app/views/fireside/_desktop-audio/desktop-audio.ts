import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import {
	FiresideRTCUser,
	startDesktopAudioPlayback,
	stopDesktopAudioPlayback,
} from '../../../../_common/fireside/rtc/user';
import { FiresideController, FiresideControllerKey } from '../controller/controller';

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
		// Don't play desktop audio for our own local user.
		if (this.c.rtc?.isFocusingMe) {
			return;
		}

		await startDesktopAudioPlayback(this.rtcUser);
	}

	beforeDestroy() {
		stopDesktopAudioPlayback(this._myRtcUser);
	}
}
