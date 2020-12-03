import { Component, Emit } from 'vue-property-decorator';
import { BaseForm, FormOnLoad } from '../../../../../_common/form-vue/form.service';

type FormModel = {
	title: string;
};

@Component({})
export default class FormRoomDetails extends BaseForm<FormModel> implements FormOnLoad {
	@Emit('submit')
	emitSubmit(_title: string) {}

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
		this.emitSubmit(this.formModel.title);
	}
}
