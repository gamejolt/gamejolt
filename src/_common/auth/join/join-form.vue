<script lang="ts" src="./join-form"></script>

<template>
	<div
		:class="{
			'auth-form-overlay': overlay,
		}"
	>
		<div class="auth-form-container">
			<div class="anim-fade-in">
				<app-button
					class="-google"
					block
					solid
					:disabled="Connection.isClientOffline || blocked"
					@click="linkedChoose('google')"
				>
					<img src="../google-icon.svg" alt="" />
					<span><translate>Sign up with Google</translate></span>
				</app-button>
			</div>

			<div class="auth-line-thru">
				<translate>or</translate>
			</div>

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

					<app-form-group
						name="username"
						:label="$gettext('Username')"
						:hide-label="true"
					>
						<app-form-control
							type="text"
							:disabled="blocked"
							:rules="{
								min: 3,
								max: 30,
								pattern: 'username',
								availability: {
									url: '/web/auth/check-field-availability/username',
								},
							}"
							:validate-on="['blur']"
							:placeholder="$gettext('Username')"
						/>

						<app-form-control-errors />
					</app-form-group>

					<app-form-group
						name="password"
						:label="$gettext('Password')"
						:hide-label="true"
					>
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

					<div class="form-group">
						<app-form-button block :disabled="blocked">
							<translate>Sign Up</translate>
						</app-form-button>
					</div>
				</fieldset>

				<div v-if="blocked" class="alert alert-notice -blocked-message">
					<translate>You must wait 15 minutes before creating another account.</translate>
				</div>
			</app-form>

			<div class="-terms">
				By signing up, you agree to the
				<a :href="Environment.baseUrl + '/terms'">Terms of Use</a> and
				<a :href="Environment.baseUrl + '/privacy'">Privacy Policy</a>, including the
				<a :href="Environment.baseUrl + '/cookies'">Cookie Policy</a>.
			</div>
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../auth-form'

// 4px is the spacing below form groups/the submit button
.-terms
	font-size: 12px
	margin-top: 16px - 4px

	@media $media-sm-up
		margin-top: 24px - 4px

	.auth-form-overlay &
		text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3)

.-blocked-message
	margin-top: 5px
</style>
