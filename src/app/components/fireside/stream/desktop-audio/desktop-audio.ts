import { Inject, Options, Prop, Vue } from 'vue-property-decorator';
import {
	FiresideRTCUser,
	startDesktopAudioPlayback,
	stopDesktopAudioPlayback,
} from '../../../../../_common/fireside/rtc/user';
import { FiresideController, FiresideControllerKey } from '../../controller/controller';

@Options({})
export default class AppFiresideDesktopAudio extends Vue {
	@Prop({ type: Object, required: true })
	rtcUser!: FiresideRTCUser;

	@Inject({ from: FiresideControllerKey })
	c!: FiresideController;

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

	beforeUnmount() {
		stopDesktopAudioPlayback(this._myRtcUser);
	}
}
