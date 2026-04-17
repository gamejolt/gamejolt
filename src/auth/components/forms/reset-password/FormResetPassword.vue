<script lang="ts" setup>
import { Api } from '~common/api/api.service';
import { Connection } from '~common/connection/connection-service';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControl from '~common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import { validateMaxLength, validateMinLength } from '~common/form-vue/validators';
import AppTranslate from '~common/translate/AppTranslate.vue';

type FormModel = {
	password: string;
};

type Props = {
	userId: number;
	token: string;
};
const { userId, token } = defineProps<Props>();

const emit = defineEmits<{
	submit: [];
}>();

const form: FormController<FormModel> = createForm<FormModel>({
	warnOnDiscard: false,
	onInit() {
		form.formModel.password = '';
	},
	onSubmit() {
		return Api.sendRequest('/web/auth/reset-password/' + userId, {
			key: token,
			password: form.formModel.password,
		});
	},
	onSubmitSuccess() {
		emit('submit');
	},
});
</script>

<template>
	<AppForm :controller="form">
		<fieldset :disabled="Connection.isClientOffline ? 'true' : undefined">
			<AppFormGroup name="password" :label="$gettext('New Password')" :hide-label="true">
				<p class="help-block">
					<AppTranslate>
						If you'd like to reset your password, enter a new one below.
					</AppTranslate>
				</p>

				<AppFormControl
					type="password"
					:validators="[validateMinLength(4), validateMaxLength(300)]"
					validate-on-blur
					:placeholder="$gettext('New Password')"
				/>

				<AppFormControlErrors />
			</AppFormGroup>

			<br />

			<AppFormButton block>
				<AppTranslate>Reset Password</AppTranslate>
			</AppFormButton>
		</fieldset>
	</AppForm>
</template>
