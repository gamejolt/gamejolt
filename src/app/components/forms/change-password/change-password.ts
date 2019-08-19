import { Api } from '../../../../_common/api/api.service';
import { BaseForm, FormOnInit, FormOnSubmit } from '../../../../_common/form-vue/form.service';
import { Component, Prop } from 'vue-property-decorator';

type FormModel = {
	old_password: string;
	password: string;
	confirm_password: string;
};

@Component({})
export default class FormChangePassword extends BaseForm<FormModel>
	implements FormOnInit, FormOnSubmit {
	@Prop({ type: Boolean, default: true })
	requiresOld!: boolean;

	warnOnDiscard = false;
	resetOnSubmit = true;

	onInit() {
		this.setField('old_password', '');
		this.setField('password', '');
		this.setField('confirm_password', '');
	}

	onSubmit() {
		return Api.sendRequest('/web/dash/account/set-password', {
			old_password: this.formModel.old_password,
			password: this.formModel.password,
		});
	}
}
