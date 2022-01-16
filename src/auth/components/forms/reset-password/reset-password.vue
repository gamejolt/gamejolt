<script lang="ts">
import { mixins, Options, Prop } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { Connection } from '../../../../_common/connection/connection-service';
import { BaseForm, FormOnSubmit } from '../../../../_common/form-vue/form.service';

class Wrapper extends BaseForm<any> {}

@Options({})
export default class FormResetPassword extends mixins(Wrapper) implements FormOnSubmit {
	@Prop(Number) userId!: number;
	@Prop(String) token!: string;

	readonly Connection = Connection;

	created() {
		this.form.warnOnDiscard = false;
	}

	onInit() {
		this.setField('password', '');
	}

	onSubmit() {
		// Will return a bad request if the user ID or key is invalid. Since we
		// checked it in the route component, let's let it process the payload
		// and show an error page.
		return Api.sendRequest('/web/auth/reset-password/' + this.userId, {
			key: this.token,
			password: this.formModel.password,
		});
	}
}
</script>

<template>
	<app-form :controller="form">
		<fieldset :disabled="Connection.isClientOffline">
			<app-form-group
				name="password"
				:label="$gettext('auth.reset_password.password_label')"
				:hide-label="true"
			>
				<p class="help-block">
					<translate>auth.reset_password.password_help</translate>
				</p>

				<app-form-control
					type="password"
					:validators="[validateMinLength(4), validateMaxLength(300)]"
					:validate-on="['blur']"
					:placeholder="$gettext('auth.reset_password.password_label')"
				/>

				<app-form-control-errors />
			</app-form-group>

			<br />

			<app-form-button block>
				<translate>auth.reset_password.submit_button</translate>
			</app-form-button>
		</fieldset>
	</app-form>
</template>
