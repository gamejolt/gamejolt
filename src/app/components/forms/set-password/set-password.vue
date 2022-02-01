<script lang="ts">
import { mixins, Options } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { BaseForm, FormOnSubmit } from '../../../../_common/form-vue/form.service';

class Wrapper extends BaseForm<any> {}

@Options({})
export default class FormSetPassword extends mixins(Wrapper) implements FormOnSubmit {
	created() {
		this.form.warnOnDiscard = false;
	}

	onInit() {
		this.setField('password', '');
	}

	onSubmit() {
		return Api.sendRequest('/web/dash/account/set-password', {
			password: this.formModel.password,
		});
	}
}
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
