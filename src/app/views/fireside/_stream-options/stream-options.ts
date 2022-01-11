import { setup } from 'vue-class-component';
import { Emit, Inject, Options, Vue } from 'vue-property-decorator';
import { stopStreaming } from '../../../../_common/fireside/rtc/producer';
import { useCommonStore } from '../../../../_common/store/common-store';
import { AppTooltip } from '../../../../_common/tooltip/tooltip-directive';
import {
	FiresideController,
	FiresideControllerKey,
} from '../../../components/fireside/controller/controller';
import { StreamSetupModal } from '../../../components/fireside/stream/setup/setup-modal.service';
import AppFiresideSettingsPopper from '../_settings-popper/settings-popper.vue';

@Options({
	components: {
		AppFiresideSettingsPopper,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppFiresideStreamOptions extends Vue {
	commonStore = setup(() => useCommonStore());

	@Inject({ from: FiresideControllerKey })
	c!: FiresideController;

	get user() {
		return this.commonStore.user;
	}

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
