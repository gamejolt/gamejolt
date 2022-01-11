import { mixins, Options, Prop } from 'vue-property-decorator';
import { Fireside } from '../../../../_common/fireside/fireside.model';
import { BaseModal } from '../../../../_common/modal/base';
import { FormModel } from '../../forms/fireside/publish/publish';
import FormFiresidePublish from '../../forms/fireside/publish/publish.vue';
import { FiresidePublishModalResult } from './publish-modal.service';

@Options({
	components: {
		FormFiresidePublish,
	},
})
export default class AppFiresidePublishModal extends mixins(BaseModal) {
	@Prop({ type: Object, required: true }) fireside!: Fireside;

	onFormSubmit(formData: FormModel) {
		this.modal.resolve({
			doPublish: true,
			autoFeature: formData.auto_feature,
		} as FiresidePublishModalResult);
	}
}
