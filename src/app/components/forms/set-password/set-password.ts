import { Component } from 'vue-property-decorator';
import * as View from '!view!./set-password.html';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import {
	BaseForm,
	FormOnInit,
	FormOnSubmit,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';

@View
@Component({})
export class FormSetPassword extends BaseForm<any> implements FormOnInit, FormOnSubmit {
	warnOnDiscard = false;

	onInit() {
		this.setField('password', '');
	}

	onSubmit() {
		return Api.sendRequest('/web/dash/account/set-password', {
			password: this.formModel.password,
		});
	}
}
