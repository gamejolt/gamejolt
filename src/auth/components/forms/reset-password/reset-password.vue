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
	<AppForm :controller="form">
		<fieldset :disabled="Connection.isClientOffline ? 'true' : undefined">
			<AppFormGroup name="password" :label="$gettext('New Password')" :hide-label="true">
				<p class="help-block">
					<AppTranslate>
						If you'd like to reset your password, enter a new one below.
					</AppTranslate>
				</p>

				<AppFormControl
					type="password"
					:validators="[validateMinLength(4), validateMaxLength(300)]"
					validate-on-blur
					:placeholder="$gettext('New Password')"
				/>

				<AppFormControlErrors />
			</AppFormGroup>

			<br />

			<AppFormButton block>
				<AppTranslate>Reset Password</AppTranslate>
			</AppFormButton>
		</fieldset>
	</AppForm>
</template>
