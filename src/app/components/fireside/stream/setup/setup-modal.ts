import { mixins, Options, Prop } from 'vue-property-decorator';
import AppIllustration from '../../../../../_common/illustration/AppIllustration.vue';
import { BaseModal } from '../../../../../_common/modal/base';
import { illNoCommentsSmall } from '../../../../img/ill/illustrations';
import { FiresideController } from '../../controller/controller';
import AppStreamSetup from './setup.vue';

@Options({
	components: {
		AppStreamSetup,
		AppIllustration,
	},
})
export default class AppStreamSetupModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: true })
	c!: FiresideController;

	readonly illNoCommentsSmall = illNoCommentsSmall;

	onClose() {
		this.modal.dismiss();
	}
}