import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./change-password.html';

import {
	BaseForm,
	FormOnInit,
	FormOnSubmit,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { FormOnSubmitSuccess } from '../../../../lib/gj-lib-client/components/form-vue/form.service';

type FormModel = {
	old_password: string;
	password: string;
	confirm_password: string;
};

@View
@Component({})
export class FormChangePassword extends BaseForm<FormModel> implements FormOnInit, FormOnSubmit {
	@Prop({ type: Boolean, default: true })
	requiresOld: boolean;

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
