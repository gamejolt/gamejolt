import { Component, Prop } from 'vue-property-decorator';
import AppLoading from '../../../../_common/loading/loading.vue';
import { BaseModal } from '../../../../_common/modal/base';
import { FiresideController } from '../../../components/fireside/controller/controller';
import FormFiresideEdit from '../../../components/forms/fireside/edit/edit.vue';

@Component({
	components: {
		FormFiresideEdit,
		AppLoading,
	},
})
export default class AppFiresideEditModal extends BaseModal {
	@Prop({ type: FiresideController, required: true })
	controller!: FiresideController;

	onFormSubmit() {
		this.modal.resolve();
	}
}
