<script lang="ts" src="./retrieve-login"></script>

<template>
	<app-form :controller="form">
		<fieldset :disabled="Connection.isClientOffline">
			<app-form-group name="email" :label="$gettext('Email or Username')" hide-label>
				<p class="help-block">
					<translate>
						Enter the email address or username on your account and we'll send you a
						link to get into your account.
					</translate>
				</p>

				<app-form-control
					type="text"
					:validate-on="['blur']"
					:placeholder="$gettext('Email or Username')"
					@changed="onChanged"
				/>

				<app-form-control-errors />
			</app-form-group>

			<br />

			<div
				v-if="invalidEmail"
				v-translate
				class="alert alert-notice anim-fade-in-enlarge no-animate-leave"
			>
				<p>
					Hmm, we couldn't find you in our system. Maybe you didn't
					<a href="/join">sign up yet</a>?
				</p>
			</div>

			<app-form-button block>
				<translate>Send Login Link</translate>
			</app-form-button>
		</fieldset>
	</app-form>
</template>
