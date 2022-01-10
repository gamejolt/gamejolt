import { Emit, mixins, Options, Prop } from 'vue-property-decorator';
import AppGrecaptchaWidget from '../../../auth/components/grecaptcha/widget/widget.vue';
import { trackLoginCaptcha } from '../../analytics/analytics.service';
import { Api } from '../../api/api.service';
import { Connection } from '../../connection/connection-service';
import { Environment } from '../../environment/environment.service';
import { BaseForm, FormOnLoad, FormOnSubmit, FormOnSubmitError } from '../../form-vue/form.service';
import { validateUsername } from '../../form-vue/validators';
import { Provider } from '../../linked-account/linked-account.model';
import { LinkedAccounts } from '../../linked-account/linked-accounts.service';
import AppLoading from '../../loading/loading.vue';
import { AppTooltip } from '../../tooltip/tooltip-directive';
import googleImage from '../google-icon.svg';

class Wrapper extends BaseForm<any> {}

@Options({
	components: {
		AppLoading,
		AppGrecaptchaWidget,
	},
	directives: {
		AppTooltip,
	},
})
export default class AppAuthLoginForm
	extends mixins(Wrapper)
	implements FormOnSubmit, FormOnSubmitError, FormOnLoad
{
	@Prop(Boolean)
	overlay?: boolean;

	captchaToken: string | null = null;
	captchaResponse: string | null = null;
	captchaCounter = 0;
	/** How many attempts the user has until they get blocked. */
	attempts = 5;

	// Errors
	invalidLogin = false;
	blockedLogin = false;
	invalidCaptcha = false;
	approvedLoginRejected = false;
	tryAgain = false;

	@Emit('needs-approved-login')
	emitNeedsApprovedLogin(_token: string) {}

	get loadUrl() {
		return `/web/auth/login`;
	}

	get showForm() {
		return this.captchaToken === null;
	}

	readonly Connection = Connection;
	readonly Environment = Environment;
	readonly validateUsername = validateUsername;
	readonly googleImage = googleImage;

	created() {
		this.form.warnOnDiscard = false;
	}

	onChanged() {
		this.resetErrors();
	}

	resetErrors() {
		this.invalidLogin = false;
		this.blockedLogin = false;
		this.invalidCaptcha = false;
		this.approvedLoginRejected = false;
		this.tryAgain = false;
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

			if (response.success === true) {
				trackLoginCaptcha(this.formModel.username, 'solved', this.captchaCounter);
			}
		} else {
			response = await Api.sendRequest('/web/auth/login', this.formModel);

			// If we got a token with the response, the server requests us to solve a captcha.
			if (response.token) {
				this.captchaToken = response.token;
				this.captchaCounter++;
				trackLoginCaptcha(this.formModel.username, 'presented', this.captchaCounter);
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
						trackLoginCaptcha(this.formModel.username, 'failed', this.captchaCounter);
						break;
					case 'approve-login':
						this.emitNeedsApprovedLogin(response.loginPollingToken);
						break;
					case 'approve-login-rejected':
						this.approvedLoginRejected = true;
						break;
					case 'try-again':
						this.tryAgain = true;
						break;
				}
			}
		}

		return response;
	}

	onRecaptchaResponse(captchaResponse: string) {
		this.captchaResponse = captchaResponse;
		this.form.submit();
	}

	onSubmitError() {
		// Any error resets this component to show the form again.
		this.captchaToken = null;
	}

	linkedChoose(provider: Provider) {
		LinkedAccounts.login(this.$router, provider);
	}
}
