import { Component, Prop } from 'vue-property-decorator';
import { propRequired } from '../../../../utils/vue';
import { BaseModal } from '../../../../_common/modal/base';
import { FiresideHostRTC } from '../fireside-host-rtc';
import AppStreamSetup from './stream-setup.vue';

@Component({
	components: {
		AppStreamSetup,
	},
})
export default class AppStreamSetupModal extends BaseModal {
	@Prop(propRequired(FiresideHostRTC)) firesideHostRtc!: FiresideHostRTC;

	onClose() {
		this.modal.dismiss();
	}
}
