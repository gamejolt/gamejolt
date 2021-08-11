import { Emit, Inject, Options, Vue } from 'vue-property-decorator';
import AppPopper from '../../../../_common/popper/popper.vue';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { FiresideRTC, FiresideRTCKey } from '../fireside-rtc';
import { setAudioPlayback } from '../fireside-rtc-user';

@Options({
	components: {
		AppPopper,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideStreamOptions extends Vue {
	@Inject({ from: FiresideRTCKey })
	rtc!: FiresideRTC;

	@Emit('show-popper') emitShowPopper() {}
	@Emit('hide-popper') emitHidePopper() {}

	get shouldMute() {
		return this.rtc.users.some(i => !i.micAudioMuted);
	}

	muteAll() {
		return this.rtc.users.forEach(i => setAudioPlayback(i, false));
	}

	unmuteAll() {
		return this.rtc.users.forEach(i => setAudioPlayback(i, true));
	}

	toggleVideoStats() {
		this.rtc.shouldShowVideoStats = !this.rtc.shouldShowVideoStats;
	}
}
