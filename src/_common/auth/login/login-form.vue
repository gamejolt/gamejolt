<template>
	<div
		:class="{
			'auth-form-overlay': overlay,
		}"
	>
		<div class="auth-form-container">
			<p class="page-help">
				By logging in, you agree to the
				<a :href="Environment.baseUrl + '/terms'">Terms of Use</a>
				and
				<a :href="Environment.baseUrl + '/privacy'">Privacy Policy</a>
				, including the
				<a :href="Environment.baseUrl + '/cookies'">Cookie Policy</a>
				.
			</p>

			<app-form class="auth-form" name="loginForm">
				<fieldset :disabled="Connection.isClientOffline">
					<!--
					Min not needed since the login will fail if incorrect anyway.
				-->

					<app-form-group name="username" :label="$gettext('Username')" :hide-label="true">
						<app-form-control
							type="text"
							:placeholder="$gettext('Username')"
							:rules="{ max: 30, pattern: 'username' }"
							@changed="onChanged"
						/>

						<app-form-control-errors />
					</app-form-group>

					<app-form-group name="password" :label="$gettext('Password')" :hide-label="true">
						<app-form-control
							type="password"
							:placeholder="$gettext('Password')"
							:rules="{ max: 300 }"
							@changed="onChanged"
						/>

						<app-form-control-errors />
					</app-form-group>

					<br />

					<div class="alert alert-notice anim-fade-in-enlarge no-animate-leave" v-if="invalidLogin">
						<p><translate>Incorrect username or password.</translate></p>
						<p>
							<translate>
								Please note, after 5 incorrect login attempts you will be locked out of your account
								for 1 hour.
							</translate>
						</p>
						<p>
							<translate>
								If you've forgotten your username or password, you can retrieve them below.
							</translate>
						</p>
					</div>

					<div class="alert alert-notice anim-fade-in-enlarge no-animate-leave" v-if="blockedLogin">
						<p>
							<translate>
								Whoa, there! You've tried to log in too many times and just straight up failed.
								You'll have to cool down a bit before trying again.
							</translate>
						</p>
					</div>

					<app-loading
						v-if="state.isProcessing"
						:label="$gettext('Figuring this all out...')"
						:centered="true"
					/>

					<div class="form-group">
						<app-form-button block>
							<translate>Log In</translate>
						</app-form-button>
					</div>
				</fieldset>
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
				:disabled="Connection.isClientOffline"
				@click="linkedChoose('facebook')"
			>
				<translate>Continue with Facebook</translate>
			</app-button>

			<app-button
				class="-twitter anim-fade-in-enlarge stagger"
				block
				solid
				:disabled="Connection.isClientOffline"
				@click="linkedChoose('twitter')"
			>
				<translate>Continue with Twitter</translate>
			</app-button>

			<app-button
				class="-google anim-fade-in-enlarge stagger"
				block
				solid
				:disabled="Connection.isClientOffline"
				@click="linkedChoose('google')"
			>
				<translate>Continue with Google</translate>
			</app-button>

			<app-button
				class="-twitch anim-fade-in-enlarge stagger"
				block
				solid
				:disabled="Connection.isClientOffline"
				@click="linkedChoose('twitch')"
			>
				<translate>Continue with Twitch</translate>
			</app-button>
		</p>
	</div>
</template>

<style lang="stylus" scoped>
@require '../auth-form'
</style>

<script lang="ts" src="./login-form"></script>
