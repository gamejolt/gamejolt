<script lang="ts" src="./login-form"></script>

<template>
	<div
		:class="{
			'auth-form-overlay': overlay,
		}"
	>
		<div v-show="showForm" class="auth-form-container">
			<app-form ref="form" class="auth-form" name="loginForm">
				<fieldset :disabled="Connection.isClientOffline">
					<!-- Min not needed since the login will fail if incorrect
					anyway. -->
					<app-form-group
						name="username"
						:label="$gettext('Username')"
						:hide-label="true"
					>
						<app-form-control
							type="text"
							:placeholder="$gettext('Username')"
							:rules="{ max: 30, pattern: 'username' }"
							@changed="onChanged"
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
							:placeholder="$gettext('Password')"
							:rules="{ max: 300 }"
							@changed="onChanged"
						/>

						<app-form-control-errors />
					</app-form-group>

					<div
						v-if="tryAgain"
						class="alert alert-notice anim-fade-in-enlarge no-animate-leave"
					>
						<p>
							<translate>
								Something went wrong on our end while trying to log you in.
							</translate>
						</p>
						<p>
							<translate>Try again in a few minutes, sorry about that!</translate>
						</p>
					</div>

					<div
						v-if="invalidLogin"
						class="alert alert-notice anim-fade-in-enlarge no-animate-leave"
					>
						<p><translate>Incorrect username or password.</translate></p>
						<p>
							<translate :translate-params="{ attempts }">
								Please note, after %{ attempts } incorrect login attempts you will
								be locked out of your account for 1 hour.
							</translate>
						</p>
						<p>
							<translate>
								If you've forgotten your username or password, you can retrieve them
								below.
							</translate>
						</p>
					</div>

					<div
						v-if="blockedLogin"
						class="alert alert-notice anim-fade-in-enlarge no-animate-leave"
					>
						<p>
							<translate>
								Whoa, there! You've tried to log in too many times and just straight
								up failed. You'll have to cool down a bit before trying again.
							</translate>
						</p>
					</div>

					<div
						v-if="invalidCaptcha"
						class="alert alert-notice anim-fade-in-enlarge no-animate-leave"
					>
						<p>
							<translate>
								Oh no, your captcha couldn't be validated. Please try again.
							</translate>
						</p>
					</div>

					<div
						v-if="approvedLoginRejected"
						class="alert alert-notice anim-fade-in-enlarge no-animate-leave"
					>
						<p>
							<translate>
								The device you're logging in from has been blocked.
							</translate>
						</p>
						<p>
							<translate :translate-params="{ email: 'contact@gamejolt.com' }">
								If you did not do this, or blocked the login by mistake, contact us
								at %{ email } right away. Your account may be compromised.
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

			<div class="auth-line-thru">
				<translate>or</translate>
			</div>

			<div class="anim-fade-in">
				<app-button
					class="-google"
					solid
					block
					:disabled="Connection.isClientOffline"
					@click="linkedChoose('google')"
				>
					<img src="../google-icon.svg" alt="" />
					<span><translate>Sign in with Google</translate></span>
				</app-button>
			</div>
		</div>
		<div v-if="!showForm">
			<app-grecaptcha-widget @response="onRecaptchaResponse" />
		</div>
	</div>
</template>

<style lang="stylus" scoped>
@import '../auth-form'

.-extra-options
	display: flex
	align-items: center
	justify-content: space-between
	margin-left: -4px
	margin-right: -4px

	.button
		flex: 1 1
		margin: 0 4px
		text-align: center
</style>
