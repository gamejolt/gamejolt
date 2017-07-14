import { Component } from 'vue-property-decorator';
import * as View from '!view!./change-password.html';

import {
	BaseForm,
	FormOnInit,
	FormOnSubmit,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';

@View
@Component({})
export class FormChangePassword extends BaseForm<any> implements FormOnInit, FormOnSubmit {
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
