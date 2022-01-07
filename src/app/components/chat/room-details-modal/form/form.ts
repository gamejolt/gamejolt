import { Emit, mixins, Options } from 'vue-property-decorator';
import { BaseForm, FormOnLoad } from '../../../../../_common/form-vue/form.service';

export type FormModel = {
	title: string;
};

class Wrapper extends BaseForm<FormModel> {}

@Options({})
export default class FormRoomDetails extends mixins(Wrapper) implements FormOnLoad {
	@Emit('submit')
	emitSubmit(_model: FormModel) {}

	titleMinLength = 3;
	titleMaxLength = 50;

	get loadUrl() {
		return `/web/chat/rooms/room-edit`;
	}

	onLoad($payload: any) {
		this.titleMinLength = $payload.titleMinLength;
		this.titleMaxLength = $payload.titleMaxLength;
	}

	onRename() {
		this.emitSubmit(this.formModel);
	}
}
