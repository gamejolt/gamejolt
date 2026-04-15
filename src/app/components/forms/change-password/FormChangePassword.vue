<script lang="ts" setup>
import { Api } from '../../../../_common/api/api.service';
import AppForm, { createForm, FormController } from '../../../../_common/form-vue/AppForm.vue';
import AppFormButton from '../../../../_common/form-vue/AppFormButton.vue';
import AppFormControl from '../../../../_common/form-vue/AppFormControl.vue';
import AppFormControlError from '../../../../_common/form-vue/AppFormControlError.vue';
import AppFormControlErrors from '../../../../_common/form-vue/AppFormControlErrors.vue';
import AppFormGroup from '../../../../_common/form-vue/AppFormGroup.vue';
import {
	validateMatch,
	validateMaxLength,
	validateMinLength,
} from '../../../../_common/form-vue/validators';
import AppTranslate from '../../../../_common/translate/AppTranslate.vue';

type Props = {
	requiresOld?: boolean;
};
const { requiresOld = true } = defineProps<Props>();

const emit = defineEmits<{
	submit: [];
}>();

type FormModel = {
	old_password: string;
	password: string;
	confirm_password: string;
};

const form: FormController<FormModel> = createForm<FormModel>({
	warnOnDiscard: false,
	resetOnSubmit: true,
	onInit() {
		form.formModel.old_password = '';
		form.formModel.password = '';
		form.formModel.confirm_password = '';
	},
	onSubmit() {
		return Api.sendRequest('/web/dash/account/set-password', {
			old_password: form.formModel.old_password,
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
		<AppFormGroup v-if="requiresOld" name="old_password" :label="$gettext(`Old Password`)">
			<AppFormControl
				type="password"
				:validators="[validateMinLength(4), validateMaxLength(300)]"
				validate-on-blur
			/>

			<AppFormControlErrors label="password">
				<AppFormControlError
					when="server"
					:message="$gettext(`The password you entered is invalid.`)"
				/>
			</AppFormControlErrors>
		</AppFormGroup>

		<AppFormGroup name="password" :label="$gettext(`New Password`)">
			<AppFormControl
				type="password"
				:validators="[validateMinLength(4), validateMaxLength(300)]"
				validate-on-blur
			/>

			<AppFormControlErrors label="new password" />
		</AppFormGroup>

		<AppFormGroup name="confirm_password" :label="$gettext(`Confirm New Password`)">
			<AppFormControl
				type="password"
				:validators="[
					validateMinLength(4),
					validateMaxLength(300),
					validateMatch(form.formModel.password),
				]"
				validate-on-blur
			/>

			<AppFormControlErrors label="new password">
				<AppFormControlError
					when="match"
					:message="
						$gettext(
							`The passwords you entered don't match. Try re-typing them and make sure they're identical.`
						)
					"
				/>
			</AppFormControlErrors>
		</AppFormGroup>

		<AppFormButton>
			<AppTranslate>Change Account Password</AppTranslate>
		</AppFormButton>
	</AppForm>
</template>
