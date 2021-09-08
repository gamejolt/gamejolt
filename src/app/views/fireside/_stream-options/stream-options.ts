import Vue from 'vue';
import { Component, Emit, InjectReactive } from 'vue-property-decorator';
import { stopStreaming } from '../../../../_common/fireside/rtc/producer';
import { setAudioPlayback } from '../../../../_common/fireside/rtc/user';
import AppPopper from '../../../../_common/popper/popper.vue';
import { ScrubberCallback } from '../../../../_common/slider/slider';
import AppSlider from '../../../../_common/slider/slider.vue';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import {
	FiresideController,
	FiresideControllerKey,
	setFocusedDesktopVolume as setFiresideDesktopVolume,
} from '../controller/controller';
import { StreamSetupModal } from '../_stream-setup/stream-setup-modal.service';

@Component({
	components: {
		AppPopper,
		AppSlider,
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

	get hasOptions() {
		return this.shouldShowMuteControls || this.c.shouldShowStreamingOptions;
	}

	get shouldShowAsMuted() {
		return this.c.shouldShowVolumeControls && this.c.desktopVolume === 0;
	}

	get shouldShowMuteControls() {
		return this.c.rtc && !this.c.rtc.isStreaming;
	}

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

	onVolumeScrub({ percent }: ScrubberCallback) {
		setFiresideDesktopVolume(this.c, percent);
	}
}
