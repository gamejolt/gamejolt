import Vue from 'vue';
import { Component, InjectReactive, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { FiresideRTC, FiresideRTCKey, FiresideRTCUser } from '../fireside-rtc';

@Component({})
export default class AppFiresideDesktopAudio extends Vue {
	@Prop(propRequired(FiresideRTCUser)) rtcUser!: FiresideRTCUser;

	@InjectReactive(FiresideRTCKey) rtc!: FiresideRTC;

	private _myRtcUser!: FiresideRTCUser;

	created() {
		// 10x hack to keep the reference around for when the component gets destroyed.
		this._myRtcUser = this.rtcUser;
	}

	mounted() {
		this.rtcUser.startDesktopAudioPlayback(this.rtc);
	}

	beforeDestroy() {
		this._myRtcUser.stopDesktopAudioPlayback(this.rtc);
	}
}
