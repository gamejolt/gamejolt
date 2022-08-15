<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Api } from '../../api/api.service';
import { Connection } from '../../connection/connection-service';
import { Environment } from '../../environment/environment.service';
import { BaseForm, FormOnSubmit, FormOnSubmitSuccess } from '../../form-vue/form.service';
import { validateUsername } from '../../form-vue/validators';
import { Provider } from '../../linked-account/linked-account.model';
import { LinkedAccounts } from '../../linked-account/linked-accounts.service';
import AppLoading from '../../loading/AppLoading.vue';
import { vAppTooltip } from '../../tooltip/tooltip-directive';
import googleImage from '../google-icon.svg';

export type FormModel = {
	email: string;
	username: string;
	password: string;
	token: string;
};

class Wrapper extends BaseForm<FormModel> {}

@Options({
	components: {
		AppLoading,
	},
	directives: {
		AppTooltip: vAppTooltip,
	},
})
export default class AppAuthJoinForm
	extends mixins(Wrapper)
	implements FormOnSubmit, FormOnSubmitSuccess
{
	@Prop(Boolean)
	overlay?: boolean;

	@Prop(Boolean)
	blocked?: boolean;

	readonly Connection = Connection;
	readonly Environment = Environment;
	readonly validateUsername = validateUsername;
	readonly googleImage = googleImage;

	created() {
		this.form.warnOnDiscard = false;
	}

	onSubmit() {
		return Api.sendRequest('/web/auth/join', this.formModel);
	}

	onSubmitSuccess(response: any) {
		this.setField('token', response.token);
	}

	/**
	 * Sign up is just login without an account. It'll direct to the correct page when it figures
	 * out if they have an account in the callback URL.
	 */
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
		<div class="auth-form-container">
			<div class="anim-fade-in">
				<AppButton
					class="-google"
					block
					solid
					:disabled="Connection.isClientOffline || blocked"
					@click="linkedChoose('google')"
				>
					<img :src="googleImage" alt="" />
					<span><AppTranslate>Sign up with Google</AppTranslate></span>
				</AppButton>
			</div>

			<div class="auth-line-thru">
				<AppTranslate>or</AppTranslate>
			</div>

			<AppForm class="auth-form" :controller="form">
				<fieldset :disabled="Connection.isClientOffline ? 'true' : undefined">
					<AppFormGroup name="email" :label="$gettext('Email')" hide-label>
						<AppFormControl
							type="email"
							:disabled="blocked"
							:validators="[
								validateAvailability({
									url: '/web/auth/check-field-availability/email',
								}),
							]"
							validate-on-blur
							:placeholder="$gettext('Email')"
						/>

						<AppFormControlErrors />
					</AppFormGroup>

					<AppFormGroup name="username" :label="$gettext('Username')" hide-label>
						<AppFormControl
							type="text"
							:disabled="blocked"
							:validators="[
								validateMinLength(3),
								validateMaxLength(30),
								validateUsername(),
								validateAvailability({
									url: '/web/auth/check-field-availability/username',
								}),
							]"
							validate-on-blur
							:placeholder="$gettext('Username')"
						/>

						<AppFormControlErrors />
					</AppFormGroup>

					<AppFormGroup name="password" :label="$gettext('Password')" hide-label>
						<AppFormControl
							type="password"
							:disabled="blocked"
							:validators="[validateMinLength(4), validateMaxLength(300)]"
							validate-on-blur
							:placeholder="$gettext('Password')"
						/>

						<AppFormControlErrors />
					</AppFormGroup>

					<div class="form-group">
						<AppFormButton block :disabled="blocked">
							<AppTranslate>Sign Up</AppTranslate>
						</AppFormButton>
					</div>
				</fieldset>

				<div v-if="blocked" class="alert alert-notice -blocked-message">
					<AppTranslate>
						You must wait 15 minutes before creating another account.
					</AppTranslate>
				</div>
			</AppForm>

			<div class="-terms">
				By signing up, you agree to the
				<a :href="Environment.baseUrl + '/terms'">Terms of Use</a>
				and
				<a :href="Environment.baseUrl + '/privacy'">Privacy Policy</a>
				, including the
				<a :href="Environment.baseUrl + '/cookies'">Cookie Policy</a>
				.
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../auth-form'

// 4px is the spacing below form groups/the submit button
.-terms
	font-size: 12px
	margin-top: 16px - 4px

	@media $media-sm-up
		margin-top: 24px - 4px

	.auth-form-overlay &
		text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3)

.-blocked-message
	margin-top: 5px
</style>
