import { Options, Prop, Vue } from 'vue-property-decorator';
import { shallowSetup } from '../../../../../utils/vue';
import {
	FiresideRTCUser,
	startDesktopAudioPlayback,
	stopDesktopAudioPlayback,
} from '../../../../../_common/fireside/rtc/user';
import { useFiresideController } from '../../controller/controller';

@Options({})
export default class AppFiresideDesktopAudio extends Vue {
	@Prop({ type: Object, required: true })
	rtcUser!: FiresideRTCUser;

	c = shallowSetup(() => useFiresideController()!);

	private _myRtcUser!: FiresideRTCUser;

	created() {
		this._myRtcUser = this.rtcUser;
	}

	async mounted() {
		// Don't play desktop audio for our own local user.
		if (!this.c.rtc.value || this.c.rtc.value.isFocusingMe) {
			return;
		}

		await startDesktopAudioPlayback(this.rtcUser);
	}

	beforeUnmount() {
		stopDesktopAudioPlayback(this._myRtcUser);
	}
}
