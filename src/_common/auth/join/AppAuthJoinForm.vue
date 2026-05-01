<script lang="ts" setup>
import { Api } from '~common/api/api.service';
import googleImage from '~common/auth/google-icon.svg';
import AppButton from '~common/button/AppButton.vue';
import { Connection } from '~common/connection/connection-service';
import { BaseUrl } from '~common/environment/environment.service';
import AppFormVue, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControl from '~common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import {
	validateAvailability,
	validateMaxLength,
	validateMinLength,
	validateUsername,
} from '~common/form-vue/validators';
import { LinkedAccountProvider } from '~common/linked-account/linked-account.model';
import { LinkedAccounts } from '~common/linked-account/linked-accounts.service';

export type JoinFormModel = {
	email: string;
	username: string;
	password: string;
	token: string;
};

type Props = {
	overlay?: boolean;
	blocked?: boolean;
};
defineProps<Props>();

const emit = defineEmits<{
	submit: [model: JoinFormModel];
}>();

const form: FormController<JoinFormModel> = createForm<JoinFormModel>({
	warnOnDiscard: false,
	onSubmit() {
		return Api.sendRequest('/web/auth/join', form.formModel);
	},
	onSubmitSuccess(response: any) {
		form.formModel.token = response.token;
		emit('submit', form.formModel);
	},
});

/**
 * Sign up is just login without an account. It'll direct to the correct page
 * when it figures out if they have an account in the callback URL.
 */
function linkedChoose(provider: LinkedAccountProvider) {
	LinkedAccounts.login(provider);
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
					@click="linkedChoose(LinkedAccountProvider.Google)"
				>
					<img :src="googleImage" alt="" />
					<span>{{ $gettext(`Sign up with Google`) }}</span>
				</AppButton>
			</div>

			<div class="auth-line-thru">
				{{ $gettext(`or`) }}
			</div>

			<AppFormVue class="auth-form" :controller="form">
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
							{{ $gettext(`Sign up`) }}
						</AppFormButton>
					</div>
				</fieldset>

				<div
					v-if="blocked"
					class="alert alert-notice"
					:style="{
						marginTop: `4px`,
					}"
				>
					{{ $gettext(`You must wait 15 minutes before creating another account.`) }}
				</div>
			</AppFormVue>

			<div
				:style="{
					fontSize: `12px`,
					marginTop: `16px`,
					textShadow: overlay ? `1px 1px 1px rgba(0, 0, 0, 0.3)` : undefined,
				}"
			>
				By signing up, you agree to the
				<a :href="BaseUrl + '/terms'">Terms of Use</a>
				and
				<a :href="BaseUrl + '/privacy'">Privacy Policy</a>
				, including the
				<a :href="BaseUrl + '/cookies'">Cookie Policy</a>
				.
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../auth-form'
</style>
