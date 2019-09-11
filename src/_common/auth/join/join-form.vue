<template>
	<div
		:class="{
			'auth-form-overlay': overlay,
		}"
	>
		<div class="auth-form-container">
			<p class="page-help">
				By signing up, you agree to the
				<a :href="Environment.baseUrl + '/terms'">Terms of Use</a>
				and
				<a :href="Environment.baseUrl + '/privacy'">Privacy Policy</a>
				, including the
				<a :href="Environment.baseUrl + '/cookies'">Cookie Policy</a>
				.
			</p>

			<app-form class="auth-form" name="joinForm">
				<fieldset :disabled="Connection.isClientOffline">
					<app-form-group name="email" :label="$gettext('Email')" :hide-label="true">
						<app-form-control
							type="email"
							:disabled="blocked"
							:rules="{
								availability: { url: '/web/auth/check-field-availability/email' },
							}"
							:validate-on="['blur']"
							:placeholder="$gettext('Email')"
						/>

						<app-form-control-errors />
					</app-form-group>

					<app-form-group name="username" :label="$gettext('Username')" :hide-label="true">
						<app-form-control
							type="text"
							:disabled="blocked"
							:rules="{
								min: 3,
								max: 30,
								pattern: 'username',
								availability: { url: '/web/auth/check-field-availability/username' },
							}"
							:validate-on="['blur']"
							:placeholder="$gettext('Username')"
						/>

						<app-form-control-errors />
					</app-form-group>

					<app-form-group name="password" :label="$gettext('Password')" :hide-label="true">
						<app-form-control
							type="password"
							:disabled="blocked"
							:rules="{
								min: 4,
								max: 300,
							}"
							:validate-on="['blur']"
							:placeholder="$gettext('Password')"
						/>

						<app-form-control-errors />
					</app-form-group>

					<br />

					<div class="form-group">
						<app-form-button block :disabled="blocked">
							<translate>Sign Up</translate>
						</app-form-button>
					</div>
				</fieldset>

				<div class="alert alert-notice -blocked-message" v-if="blocked">
					<translate>You must wait 15 minutes before creating another account.</translate>
				</div>
			</app-form>
		</div>

		<div class="auth-line-thru">
			<translate>or</translate>
		</div>

		<p>
			<app-button
				class="-fb anim-fade-in-enlarge stagger"
				block
				solid
				:disabled="Connection.isClientOffline || blocked"
				@click="linkedChoose('facebook')"
			>
				<translate>Continue with Facebook</translate>
			</app-button>

			<app-button
				class="-twitter anim-fade-in-enlarge stagger"
				block
				solid
				:disabled="Connection.isClientOffline || blocked"
				@click="linkedChoose('twitter')"
			>
				<translate>Continue with Twitter</translate>
			</app-button>

			<app-button
				class="-google anim-fade-in-enlarge stagger"
				block
				solid
				:disabled="Connection.isClientOffline || blocked"
				@click="linkedChoose('google')"
			>
				<translate>Continue with Google</translate>
			</app-button>

			<app-button
				class="-twitch anim-fade-in-enlarge stagger"
				block
				solid
				:disabled="Connection.isClientOffline || blocked"
				@click="linkedChoose('twitch')"
			>
				<translate>Continue with Twitch</translate>
			</app-button>
		</p>
	</div>
</template>

<style lang="stylus" scoped>
@require '../auth-form'

.-blocked-message
	margin-top: 5px

</style>

<script lang="ts" src="./join-form"></script>
