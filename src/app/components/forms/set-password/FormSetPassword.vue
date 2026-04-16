<script lang="ts" setup>
import { Api } from '~common/api/api.service';
import AppForm, { createForm, FormController } from '~common/form-vue/AppForm.vue';
import AppFormButton from '~common/form-vue/AppFormButton.vue';
import AppFormControl from '~common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '~common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '~common/form-vue/AppFormGroup.vue';
import { validateMaxLength, validateMinLength } from '~common/form-vue/validators';
import AppTranslate from '~common/translate/AppTranslate.vue';

const emit = defineEmits<{
	submit: [];
}>();

const form: FormController<any> = createForm<any>({
	warnOnDiscard: false,
	onInit() {
		form.formModel.password = '';
	},
	onSubmit() {
		return Api.sendRequest('/web/dash/account/set-password', {
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
		<AppFormGroup name="password">
			<AppFormControl
				type="password"
				:validators="[validateMinLength(4), validateMaxLength(30)]"
				validate-on-blur
			/>
			<AppFormControlErrors />
		</AppFormGroup>

		<AppFormButton>
			<AppTranslate>Set Account Password</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
