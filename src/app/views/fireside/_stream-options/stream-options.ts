import Vue from 'vue';
import { Component, Emit, InjectReactive } from 'vue-property-decorator';
import { stopStreaming } from '../../../../_common/fireside/rtc/producer';
import { AppState, AppStore } from '../../../../_common/store/app-store';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import {
	FiresideController,
	FiresideControllerKey,
} from '../../../components/fireside/controller/controller';
import { StreamSetupModal } from '../../../components/fireside/stream/setup/setup-modal.service';
import AppFiresideSettingsPopper from '../_settings-popper/settings-popper.vue';

@Component({
	components: {
		AppFiresideSettingsPopper,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideStreamOptions extends Vue {
	@AppState user!: AppStore['user'];

	@InjectReactive(FiresideControllerKey)
	c!: FiresideController;

	@Emit('show-popper') emitShowPopper() {}
	@Emit('hide-popper') emitHidePopper() {}

	onClickEditStream() {
		StreamSetupModal.show(this.c);
	}

	onClickStopStreaming() {
		if (!this.c.rtc?.producer) {
			return;
		}

		stopStreaming(this.c.rtc.producer);
	}
}
