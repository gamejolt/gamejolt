<script lang="ts" src="./approve-login"></script>

<template>
	<div class="anim-fade-in-up">
		<h2 class="section-header">
			<translate>You must approve this device</translate>
		</h2>

		<p>
			<translate>
				We've sent you an email with a link to approve this device. We are doing this in
				order to protect your account.
			</translate>
		</p>

		<div v-if="isPolling" class="-polling">
			<p class="small text-muted">
				<translate>
					If you don't see the email within a few minutes, please check your spam folder.
					It might have gobbled it up.
				</translate>
			</p>
		</div>
		<template v-else>
			<div class="-error alert alert-notice">
				<translate v-if="isExpired">
					Oh no! This login request has expired. Please try logging in again.
				</translate>
				<translate v-else-if="isRejected">
					Oh no! This login request got rejected.
				</translate>
			</div>

			<app-button class="-back-button" :to="{ name: 'auth.login' }" block>
				<translate>Go Back</translate>
			</app-button>
		</template>

		<!--
			We poll to see if their account gets authorized or not.
			When it does, we can log them in.
		-->
		<app-progress-poller
			v-if="pollingToken"
			:url="`/web/auth/poll-blocked-login/${pollingToken}`"
			@complete="onApproved"
			@error="onError"
		/>
	</div>
</template>

<style lang="stylus" scoped>
.-polling
	display: flex
	flex-direction: column
	align-items: center
	justify-content: center

	.-loading
		margin-bottom: 0

.-error
	display: flex
	align-items: center
	justify-content: center

.-back-button
	border-bottom: $border-width-base solid !important
</style>
