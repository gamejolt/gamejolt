<script lang="ts" setup>
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';
import { Api } from '../../../../_common/api/api.service';
import AppForm, { createForm, FormController } from '../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../_common/form-vue/AppFormGroup.vue';
import { validateMaxLength, validateMinLength } from '../../../../_common/form-vue/validators';

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
