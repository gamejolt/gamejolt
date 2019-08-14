import { Component } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { Connection } from '../../../../_common/connection/connection-service';
import { BaseForm, FormOnSubmit } from '../../../../_common/form-vue/form.service';

@Component({})
export default class FormRetrieveLogin extends BaseForm<any> implements FormOnSubmit {
	warnOnDiscard = false;

	readonly Connection = Connection;

	onChanged() {
		this.setState('invalidEmail', false);
	}

	async onSubmit() {
		const response = await Api.sendRequest('/web/auth/retrieve', this.formModel);

		if (response.success === false) {
			if (response.reason && response.reason === 'invalid-email') {
				this.setState('invalidEmail', true);
			}
		}

		return response;
	}
}
