import { Component, Emit } from 'vue-property-decorator';
import { BaseForm } from '../../../../../_common/form-vue/form.service';

type FormModel = {
	title: string;
};

@Component({})
export default class FormRoomDetails extends BaseForm<FormModel> {
	@Emit('submit')
	emitSubmit(_title: string) {}

	onSubmit() {
		this.emitSubmit(this.formModel.title);
	}
}
