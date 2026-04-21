<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { trackLoginCaptcha } from '~common/analytics/analytics.service';
import { Api } from '~common/api/api.service';
import googleImage from '~common/auth/google-icon.svg';
import AppButton from '~common/button/AppButton.vue';
import { Connection } from '~common/connection/connection-service';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControl from '~common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import { validateMaxLength, validateUsername } from '~common/form-vue/validators';
import AppGrecaptchaWidget from '~common/grecaptcha/widget/AppGrecaptchaWidget.vue';
import { LinkedAccountProvider } from '~common/linked-account/linked-account.model';
import { LinkedAccounts } from '~common/linked-account/linked-accounts.service';
import AppLoading from '~common/loading/AppLoading.vue';
import AppTranslate from '~common/translate/AppTranslate.vue';

type FormModel = {
	username: string;
	password: string;
};

type Props = {
	overlay?: boolean;
};
const { overlay } = defineProps<Props>();

const emit = defineEmits<{
	'needs-approved-login': [token: string];
	submit: [formModel: FormModel, response: any];
}>();

const router = useRouter();

const captchaToken = ref<string | null>(null);
const captchaResponse = ref<string | null>(null);
const captchaCounter = ref(0);
/** How many attempts the user has until they get blocked. */
const attempts = ref(5);

const invalidLogin = ref(false);
const blockedLogin = ref(false);
const invalidCaptcha = ref(false);
const approvedLoginRejected = ref(false);
const tryAgain = ref(false);

const showForm = computed(() => captchaToken.value === null);

const form: FormController<FormModel> = createForm<FormModel>({
	warnOnDiscard: false,
	loadUrl: `/web/auth/login`,
	onLoad($payload: any) {
		attempts.value = $payload.attempts;
	},
	async onSubmit() {
		resetErrors();

		let response;

		if (captchaToken.value) {
			response = await Api.sendRequest(
				`/web/auth/login`,
				{
					token: captchaToken.value,
					captcha: captchaResponse.value,
				},
				{ detach: true }
			);

			if (response.success === true) {
				trackLoginCaptcha(form.formModel.username, 'solved', captchaCounter.value);
			}
		} else {
			response = await Api.sendRequest('/web/auth/login', form.formModel);

			if (response.token) {
				captchaToken.value = response.token;
				captchaCounter.value++;
				trackLoginCaptcha(form.formModel.username, 'presented', captchaCounter.value);
			}
		}

		if (response.success === false) {
			if (response.reason) {
				switch (response.reason) {
					case 'invalid-login':
						invalidLogin.value = true;
						break;
					case 'blocked':
						blockedLogin.value = true;
						break;
					case 'captcha':
					case 'token':
						invalidCaptcha.value = true;
						trackLoginCaptcha(form.formModel.username, 'failed', captchaCounter.value);
						break;
					case 'approve-login':
						emit('needs-approved-login', response.loginPollingToken);
						break;
					case 'approve-login-rejected':
						approvedLoginRejected.value = true;
						break;
					case 'try-again':
						tryAgain.value = true;
						break;
				}
			}
		}

		return response;
	},
	onSubmitError() {
		captchaToken.value = null;
	},
	onSubmitSuccess(response) {
		emit('submit', form.formModel, response);
	},
});

function resetErrors() {
	invalidLogin.value = false;
	blockedLogin.value = false;
	invalidCaptcha.value = false;
	approvedLoginRejected.value = false;
	tryAgain.value = false;
}

function onRecaptchaResponse(response: string) {
	captchaResponse.value = response;
	form.submit();
}

function linkedChoose(provider: LinkedAccountProvider) {
	LinkedAccounts.login(router, provider);
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
							@changed="resetErrors"
						/>

						<AppFormControlErrors />
					</AppFormGroup>

					<AppFormGroup name="password" :label="$gettext('Password')" hide-label>
						<AppFormControl
							type="password"
							:placeholder="$gettext('Password')"
							:validators="[validateMaxLength(300)]"
							@changed="resetErrors"
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
					@click="linkedChoose(LinkedAccountProvider.Google)"
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
