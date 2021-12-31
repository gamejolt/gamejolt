import { Options } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { BaseForm, FormOnSubmit } from '../../../../_common/form-vue/form.service';

@Options({})
export default class FormSetPassword extends BaseForm<any> implements FormOnSubmit {
	created() {
		this.form.warnOnDiscard = false;
	}

	onInit() {
		this.setField('password', '');
	}

	onSubmit() {
		return Api.sendRequest('/web/dash/account/set-password', {
			password: this.formModel.password,
		});
	}
}
