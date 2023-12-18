<script lang="ts" setup>
import { ref } from 'vue';
import { Api } from '../../../../_common/api/api.service';
import { Connection } from '../../../../_common/connection/connection-service';
import AppForm, { createForm, FormController } from '../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../_common/form-vue/AppFormGroup.vue';
import { $gettext } from '../../../../_common/translate/translate.service';

interface RetrieveLoginFormModel {
	email: string;
}

const invalidEmail = ref(false);

const form: FormController<RetrieveLoginFormModel> = createForm({
	warnOnDiscard: false,
	onInit() {
		invalidEmail.value = false;
	},
	onChange() {
		invalidEmail.value = false;
	},
	async onSubmit() {
		const response = await Api.sendRequest('/web/auth/retrieve', form.formModel);
		if (response.success === false) {
			if (response.reason && response.reason === 'invalid-email') {
				invalidEmail.value = true;
			}
		}
		return response;
	},
});

function onChanged() {
	invalidEmail.value = false;
}
</script>

<template>
	<AppForm :controller="form">
		<fieldset :disabled="Connection.isClientOffline ? 'true' : undefined">
			<AppFormGroup name="email" :label="$gettext('Email or Username')" hide-label>
				<p class="help-block">
					{{
						$gettext(
							`Enter the email address or username on your account and we'll send you a link to get into your account.`
						)
					}}
				</p>

				<AppFormControl
					type="text"
					validate-on-blur
					:placeholder="$gettext('Email or Username')"
					@changed="onChanged"
				/>

				<AppFormControlErrors />
			</AppFormGroup>

			<br />

			<div
				v-if="invalidEmail"
				class="alert alert-notice anim-fade-in-enlarge no-animate-leave"
			>
				<p>
					{{ $gettext(`Hmm, we couldn't find you in our system. Maybe you didn't`) }}
					{{ ' ' }}

					<a href="/join">{{ $gettext(`sign up yet?`) }}</a>
				</p>
			</div>

			<AppFormButton block>
				{{ $gettext(`Send Login Link`) }}
			</AppFormButton>
		</fieldset>
	</AppForm>
</template>
