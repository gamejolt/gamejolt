<template>
	<app-form :controller="form">
		<app-form-group
			v-if="requiresOld"
			name="old_password"
			:label="$gettext(`dash.change_pass.old_password_label`)"
		>
			<app-form-control
				type="password"
				:validators="[validateMinLength(4), validateMaxLength(300)]"
				:validate-on="['blur']"
			/>

			<app-form-control-errors label="password">
				<app-form-control-error
					when="server"
					:message="$gettext(`dash.change_pass.invalid_old_password_error`)"
				/>
			</app-form-control-errors>
		</app-form-group>

		<app-form-group name="password" :label="$gettext(`dash.change_pass.password_label`)">
			<app-form-control
				type="password"
				:validators="[validateMinLength(4), validateMaxLength(300)]"
				:validate-on="['blur']"
			/>

			<app-form-control-errors label="new password" />
		</app-form-group>

		<app-form-group
			name="confirm_password"
			:label="$gettext(`dash.change_pass.confirm_password_label`)"
		>
			<!-- TODO(vue3): confirmed -->
			<app-form-control
				type="password"
				:validators="[validateMinLength(4), validateMaxLength(300)]"
				:rules="{
					confirmed: 'password',
				}"
				:validate-on="['blur']"
			/>

			<app-form-control-errors label="new password">
				<app-form-control-error
					when="confirmed"
					:message="$gettext(`dash.change_pass.no_match_error`)"
				/>
			</app-form-control-errors>
		</app-form-group>

		<app-form-button>
			<translate>dash.change_pass.submit_button</translate>
		</app-form-button>
	</app-form>
</template>

<script lang="ts" src="./change-password"></script>
