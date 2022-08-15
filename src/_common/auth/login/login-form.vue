<script lang="ts">
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
import AppLoading from '../../loading/AppLoading.vue';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import googleImage from '../google-icon.svg';

class Wrapper extends BaseForm<any> {}

@Options({
	components: {
		AppLoading,
		AppGrecaptchaWidget,
	},
	directives: {
		AppTooltip: vAppTooltip,
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
</script>

<template>
	<div
		:class="{
			'auth-form-overlay': overlay,
		}"
	>
		<div v-show="showForm" class="auth-form-container">
			<AppForm class="auth-form" :controller="form">
				<fieldset :disabled="Connection.isClientOffline ? 'true' : undefined">
					<AppFormGroup name="username" :label="$gettext('Username')" hide-label>
						<!-- Min not needed since the login will fail if incorrect anyway. -->
						<AppFormControl
							type="text"
							:placeholder="$gettext('Username')"
							:validators="[validateMaxLength(30), validateUsername()]"
							@changed="onChanged"
						/>

						<AppFormControlErrors />
					</AppFormGroup>

					<AppFormGroup name="password" :label="$gettext('Password')" hide-label>
						<AppFormControl
							type="password"
							:placeholder="$gettext('Password')"
							:validators="[validateMaxLength(300)]"
							@changed="onChanged"
						/>

						<AppFormControlErrors />
					</AppFormGroup>

					<div
						v-if="tryAgain"
						class="alert alert-notice anim-fade-in-enlarge no-animate-leave"
					>
						<p>
							<AppTranslate>
								Something went wrong on our end while trying to log you in.
							</AppTranslate>
						</p>
						<p>
							<AppTranslate>
								Try again in a few minutes, sorry about that!
							</AppTranslate>
						</p>
					</div>

					<div
						v-if="invalidLogin"
						class="alert alert-notice anim-fade-in-enlarge no-animate-leave"
					>
						<p><AppTranslate>Incorrect username or password.</AppTranslate></p>
						<p>
							<AppTranslate :translate-params="{ attempts }">
								Please note, after %{ attempts } incorrect login attempts you will
								be locked out of your account for 1 hour.
							</AppTranslate>
						</p>
						<p>
							<AppTranslate>
								If you've forgotten your username or password, you can retrieve them
								below.
							</AppTranslate>
						</p>
					</div>

					<div
						v-if="blockedLogin"
						class="alert alert-notice anim-fade-in-enlarge no-animate-leave"
					>
						<p>
							<AppTranslate>
								Whoa, there! You've tried to log in too many times and just straight
								up failed. You'll have to cool down a bit before trying again.
							</AppTranslate>
						</p>
					</div>

					<div
						v-if="invalidCaptcha"
						class="alert alert-notice anim-fade-in-enlarge no-animate-leave"
					>
						<p>
							<AppTranslate>
								Oh no, your captcha couldn't be validated. Please try again.
							</AppTranslate>
						</p>
					</div>

					<div
						v-if="approvedLoginRejected"
						class="alert alert-notice anim-fade-in-enlarge no-animate-leave"
					>
						<p>
							<AppTranslate>
								The device you're logging in from has been blocked.
							</AppTranslate>
						</p>
						<p>
							<AppTranslate :translate-params="{ email: 'contact@gamejolt.com' }">
								If you did not do this, or blocked the login by mistake, contact us
								at %{ email } right away. Your account may be compromised.
							</AppTranslate>
						</p>
					</div>

					<AppLoading
						v-if="form.isProcessing"
						:label="$gettext('Figuring this all out...')"
						:centered="true"
					/>

					<div class="form-group">
						<AppFormButton block>
							<AppTranslate>Log In</AppTranslate>
						</AppFormButton>
					</div>
				</fieldset>
			</AppForm>

			<div class="auth-line-thru">
				<AppTranslate>or</AppTranslate>
			</div>

			<div class="anim-fade-in">
				<AppButton
					class="-google"
					solid
					block
					:disabled="Connection.isClientOffline"
					@click="linkedChoose('google')"
				>
					<img :src="googleImage" alt="" />
					<span><AppTranslate>Sign in with Google</AppTranslate></span>
				</AppButton>
			</div>
		</div>
		<div v-if="!showForm">
			<AppGrecaptchaWidget @response="onRecaptchaResponse" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../auth-form'

.-extra-options
	display: flex
	align-items: center
	justify-content: space-between
	margin-left: -4px
	margin-right: -4px

	.button
		flex: 1 1
		margin: 0 4px
		text-align: center
</style>
