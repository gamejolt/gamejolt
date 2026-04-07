<script lang="ts" setup>
import { Api } from '../../../../_common/api/api.service';
import AppForm, { createForm, FormController } from '../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlErrors from '../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../_common/form-vue/AppFormGroup.vue';
import { validateMaxLength, validateMinLength } from '../../../../_common/form-vue/validators';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';

type FormModel = {
	token: string;
};

type Props = {
	token: string;
};

const { token } = defineProps<Props>();

const form: FormController<FormModel> = createForm({
	onInit() {
		form.formModel.token = token;
	},
	onSubmit() {
		return Api.sendRequest('/web/dash/token/save', form.formModel);
	},
	onSubmitSuccess(response: any) {
		form.formModel.token = response.token;
	},
});
</script>

<template>
	<AppForm :controller="form">
		<AppFormGroup name="token" :label="$gettext('Game Token')">
			<AppFormControl
				type="text"
				:validators="[validateMinLength(4), validateMaxLength(30)]"
				autocomplete="off"
				focus
			/>

			<AppFormControlErrors />

			<p class="help-block">
				<AppTranslate>
					For security reasons, don't make your game token the same as your password.
				</AppTranslate>
			</p>
		</AppFormGroup>

		<AppFormButton>
			<AppTranslate>Save Game Token</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
