// TODO missing component template, is this intentional?
// import View from '!view!./twitter-email.html';
import { Api } from '../../../../_common/api/api.service';
import { BaseForm, FormOnSubmit } from '../../../../_common/form-vue/form.service';
import { Component, Prop } from 'vue-property-decorator';

@Component({})
export default class FormTwitterEmail extends BaseForm<any> implements FormOnSubmit {
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
