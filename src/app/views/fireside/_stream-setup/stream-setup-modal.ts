import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { BaseModal } from '../../../../_common/modal/base';
import { FiresideHostRtc } from '../fireside-host-rtc';
import AppStreamSetup from './stream-setup.vue';

@Component({
	components: {
		AppStreamSetup,
	},
})
export default class AppStreamSetupModal extends BaseModal {
	@Prop(propRequired(FiresideHostRtc)) firesideHostRtc!: FiresideHostRtc;

	onClose() {
		this.modal.dismiss();
	}
}
