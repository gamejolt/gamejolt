import Vue from 'vue';
import { Component, Emit, InjectReactive } from 'vue-property-decorator';
import { stopStreaming } from '../../../../_common/fireside/rtc/producer';
import { setAudioPlayback } from '../../../../_common/fireside/rtc/user';
import AppPopper from '../../../../_common/popper/popper.vue';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import { FiresideController, FiresideControllerKey } from '../controller/controller';
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
	@AppState user!: AppStore['user'];
	@InjectReactive(FiresideControllerKey) c!: FiresideController;

	@Emit('show-popper') emitShowPopper() {}
	@Emit('hide-popper') emitHidePopper() {}

	get shouldMute() {
		return this.c.rtc?.users.some(i => !i.micAudioMuted) ?? false;
	}

	muteAll() {
		return this.c.rtc?.users.forEach(i => setAudioPlayback(i, false));
	}

	unmuteAll() {
		return this.c.rtc?.users.forEach(i => setAudioPlayback(i, true));
	}

	onClickEditStream() {
		StreamSetupModal.show(this.c);
	}

	onClickStopStreaming() {
		if (this.c.hostRtc) {
			stopStreaming(this.c.hostRtc);
		}
	}
}
