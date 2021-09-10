import { Component, Prop } from 'vue-property-decorator';
import AppIllustration from '../../../../_common/illustration/illustration.vue';
import { BaseModal } from '../../../../_common/modal/base';
import { FiresideController } from '../controller/controller';
import AppStreamSetup from './stream-setup.vue';

@Component({
	components: {
		AppStreamSetup,
		AppIllustration,
	},
})
export default class AppStreamSetupModal extends BaseModal {
	@Prop({ type: FiresideController, required: true })
	c!: FiresideController;

	onClose() {
		this.modal.dismiss();
	}
}
