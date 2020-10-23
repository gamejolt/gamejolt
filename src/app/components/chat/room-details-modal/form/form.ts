import { Component, Emit } from 'vue-property-decorator';
import { BaseForm } from '../../../../../_common/form-vue/form.service';
import { ChatRoom } from '../../room';

export type FormModel = {
	title: string;
};

@Component({})
export default class FormRoomDetails extends BaseForm<FormModel> {
	modelClass = ChatRoom;

	@Emit('submit')
	emitSubmit(_title: FormModel) {}

	onSubmit() {
		const submit: FormModel = { title: this.formModel.title };
		this.emitSubmit(submit);
	}
}
