import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { BaseForm, FormOnInit, FormOnSubmit } from 'game-jolt-frontend-lib/components/form-vue/form.service';
import { Component } from 'vue-property-decorator';


@Component({})
export default class FormSetPassword extends BaseForm<any> implements FormOnInit, FormOnSubmit {
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
