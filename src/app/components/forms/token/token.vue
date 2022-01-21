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
	<app-form :controller="form">
		<app-form-group name="token" :label="$gettext('Game Token')">
			<app-form-control
				type="text"
				:validators="[validateMinLength(4), validateMaxLength(30)]"
				autocomplete="off"
				focus
			/>

			<app-form-control-errors />

			<p class="help-block">
				<translate>
					For security reasons, don't make your game token the same as your password.
				</translate>
			</p>
		</app-form-group>

		<app-form-button>
			<translate>Save Game Token</translate>
		</app-form-button>
	</app-form>
</template>
