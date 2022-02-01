<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import {
	BaseForm,
	FormOnSubmit,
	FormOnSubmitSuccess,
} from '../../../../_common/form-vue/form.service';

class Wrapper extends BaseForm<any> {}

@Options({})
export default class FormToken
	extends mixins(Wrapper)
	implements FormOnSubmit, FormOnSubmitSuccess
{
	@Prop(String) token!: string;

	onInit() {
		this.setField('token', this.token);
	}

	onSubmit() {
		return Api.sendRequest('/web/dash/token/save', this.formModel);
	}

	onSubmitSuccess(response: any) {
		this.setField('token', response.token);
	}
}
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
