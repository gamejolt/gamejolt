import { Component, Prop } from 'vue-property-decorator';
import AppGrecaptchaWidget from '../../../auth/components/grecaptcha/widget/widget.vue';
import { Api } from '../../api/api.service';
import { Connection } from '../../connection/connection-service';
import { Environment } from '../../environment/environment.service';
import AppForm from '../../form-vue/form';
import { BaseForm, FormOnLoad, FormOnSubmit, FormOnSubmitError } from '../../form-vue/form.service';
import { Provider } from '../../linked-account/linked-account.model';
import { LinkedAccounts } from '../../linked-account/linked-accounts.service';
import AppLoading from '../../loading/loading.vue';
import { AppTooltip } from '../../tooltip/tooltip-directive';

@Component({
	components: {
		AppLoading,
		AppGrecaptchaWidget,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppAuthLoginForm
	extends BaseForm<any>
	implements FormOnSubmit, FormOnSubmitError, FormOnLoad
{
	@Prop(Boolean)
	overlay?: boolean;

	warnOnDiscard = false;

	captchaToken: string | null = null;
	captchaResponse: string | null = null;
	/** How many attempts the user has until they get blocked. */
	attempts = 5;

	// Errors
	invalidLogin = false;
	blockedLogin = false;
	invalidCaptcha = false;

	$refs!: {
		form: AppForm;
	};

	get loadUrl() {
		return `/web/auth/login`;
	}

	get showForm() {
		return this.captchaToken === null;
	}

	readonly Connection = Connection;
	readonly Environment = Environment;

	onChanged() {
		this.resetErrors();
	}

	resetErrors() {
		this.invalidLogin = false;
		this.blockedLogin = false;
		this.invalidCaptcha = false;
	}

	onLoad($payload: any) {
		this.attempts = $payload.attempts;
	}

	async onSubmit() {
		this.resetErrors();

		let response;

		if (this.captchaToken) {
			// Try to solve the captcha.
			response = await Api.sendRequest(
				`/web/auth/login`,
				{
					token: this.captchaToken,
					captcha: this.captchaResponse,
				},
				{
					detach: true,
				}
			);
		} else {
			response = await Api.sendRequest('/web/auth/login', this.formModel);

			// If we got a token with the response, the server requests us to solve a captcha.
			if (response.token) {
				this.captchaToken = response.token;
			}
		}

		// Handle custom errors.
		if (response.success === false) {
			if (response.reason) {
				switch (response.reason) {
					case 'invalid-login':
						this.invalidLogin = true;
						break;
					case 'blocked':
						this.blockedLogin = true;
						break;
					case 'captcha':
					case 'token': // Technically the session expired, but it's a captcha error.
						this.invalidCaptcha = true;
						break;
				}
			}
		}

		return response;
	}

	onRecaptchaResponse(captchaResponse: string) {
		this.captchaResponse = captchaResponse;
		this.$refs.form.submit();
	}

	onSubmitError() {
		// Any error resets this component to show the form again.
		this.captchaToken = null;
	}

	linkedChoose(provider: Provider) {
		LinkedAccounts.login(this.$router, provider);
	}
}
