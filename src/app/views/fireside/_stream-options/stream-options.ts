import Vue from 'vue';
import { Component, Emit, InjectReactive, Prop } from 'vue-property-decorator';
import AppPopper from '../../../../_common/popper/popper.vue';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { FiresideHostRtc } from '../fireside-host-rtc';
import { FiresideRTC, FiresideRTCKey } from '../fireside-rtc';
import { setAudioPlayback } from '../fireside-rtc-user';
import { StreamSetupModal } from '../_stream-setup/stream-setup-modal.service';

@Component({
	components: {
		AppPopper,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideStreamOptions extends Vue {
	@InjectReactive(FiresideRTCKey) rtc!: FiresideRTC;

	@Prop({ type: FiresideHostRtc, required: false })
	hostRtc?: FiresideHostRtc;

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

	get canStream() {
		return !!this.hostRtc;
	}

	get isPersonallyStreaming() {
		return this.hostRtc?.isStreaming ?? false;
	}

	onClickEditStream() {
		if (this.hostRtc) {
			StreamSetupModal.show(this.hostRtc);
		}
	}

	onClickStopStreaming() {
		this.hostRtc?.stopStreaming();
	}
}
