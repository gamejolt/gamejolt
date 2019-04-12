<template>
	<app-form name="retrieveLoginForm">
		<fieldset :disabled="Connection.isClientOffline">
			<app-form-group name="email" :label="$gettext('auth.forgot.email_label')" :hide-label="true">
				<p class="help-block">
					<translate>auth.forgot.email_help</translate>
				</p>

				<app-form-control
					type="email"
					:validate-on="['blur']"
					:placeholder="$gettext('auth.forgot.email_label')"
					@changed="onChanged"
				/>

				<app-form-control-errors />
			</app-form-group>

			<br />

			<div
				class="alert alert-notice anim-fade-in-enlarge no-animate-leave"
				v-if="state.invalidEmail"
				v-translate
			>
				<p>
					Hmm, that email address is not in our system. Maybe you didn't
					<a href="/join">sign up yet</a>
					?
				</p>
			</div>

			<app-form-button block>
				<translate>auth.forgot.submit_button</translate>
			</app-form-button>
		</fieldset>
	</app-form>
</template>

<script lang="ts" src="./retrieve-login"></script>
