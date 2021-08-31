import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { BaseModal } from '../../../../_common/modal/base';
import { FiresideRTCProducer } from '../../../../_common/fireside/rtc/producer';
import AppStreamSetup from './stream-setup.vue';

@Component({
	components: {
		AppStreamSetup,
	},
})
export default class AppStreamSetupModal extends BaseModal {
	@Prop(propRequired(FiresideRTCProducer)) firesideHostRtc!: FiresideRTCProducer;

	onClose() {
		this.modal.dismiss();
	}
}
