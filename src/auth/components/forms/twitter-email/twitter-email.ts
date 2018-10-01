import { Component, Prop } from 'vue-property-decorator';
import View from '!view!./twitter-email.html';

import {
	BaseForm,
	FormOnSubmit,
} from '../../../../lib/gj-lib-client/components/form-vue/form.service';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';

@View
@Component({})
export class FormTwitterEmail extends BaseForm<any> implements FormOnSubmit {
	@Prop(String) stateHandle!: string;

	warnOnDiscard = false;

	duplicateEmail = false;
	rateLimit = false;

	onChanged() {
		// As soon as they change the form reset the error message.
		this.duplicateEmail = false;
	}

	/**
	 * Twitter has the unique quality of not giving us an email address. Because
	 * of this after the auth data is set up, we need to gather their email in a
	 * form and then POST it to create the account. The token data should be in
	 * their session, so all that's needed is the email address.
	 */
	async onSubmit() {
		const response = await Api.sendRequest(
			'/web/auth/twitter/create-account?state=' + this.stateHandle,
			this.formModel
		);

		if (response.success === false && response.reason) {
			if (response.reason === 'duplicate-email') {
				this.duplicateEmail = true;
			} else if (response.reason === 'rate-limit') {
				this.rateLimit = true;
			}
		}

		return response;
	}
}
