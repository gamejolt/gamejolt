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

<script lang="ts" src="./reset-password"></script>
