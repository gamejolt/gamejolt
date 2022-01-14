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
	<app-form :controller="form">
		<app-form-group name="password">
			<app-form-control
				type="password"
				:validators="[validateMinLength(4), validateMaxLength(30)]"
				:validate-on="['blur']"
			/>
			<app-form-control-errors />
		</app-form-group>

		<app-form-button>
			<translate>Set Account Password</translate>
		</app-form-button>
	</app-form>
</template>
