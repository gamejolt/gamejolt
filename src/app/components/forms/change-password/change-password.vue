<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { BaseForm, FormOnSubmit } from '../../../../_common/form-vue/form.service';
import { validateMatch } from '../../../../_common/form-vue/validators';

type FormModel = {
	old_password: string;
	password: string;
	confirm_password: string;
};

class Wrapper extends BaseForm<FormModel> {}

@Options({})
export default class FormChangePassword extends mixins(Wrapper) implements FormOnSubmit {
	@Prop({ type: Boolean, default: true })
	requiresOld!: boolean;

	readonly validateMatch = validateMatch;

	created() {
		this.form.warnOnDiscard = false;
		this.form.resetOnSubmit = true;
	}

	onInit() {
		this.setField('old_password', '');
		this.setField('password', '');
		this.setField('confirm_password', '');
	}

	onSubmit() {
		return Api.sendRequest('/web/dash/account/set-password', {
			old_password: this.formModel.old_password,
			password: this.formModel.password,
		});
	}
}
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
					validateMatch(formModel.password),
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
