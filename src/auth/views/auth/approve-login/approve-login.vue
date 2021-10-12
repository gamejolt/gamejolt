<script lang="ts" src="./approve-login"></script>

<template>
	<div class="anim-fade-in-up">
		<h2 class="section-header">
			<translate>New Login Location</translate>
		</h2>

		<p>
			<translate>It seems like you're logging in from a new device or location.</translate>
		</p>
		<p>
			<translate>We've sent you an email to approve this login.</translate>
		</p>

		<div v-if="isPolling" class="-polling">
			<app-loading big hide-label class="-loading" />
			<p class="small text-muted"><translate>Waiting for email verification...</translate></p>
			<p class="small text-muted">
				<translate>
					If you don't see the email within a few minutes, please check your spam folder.
					It might have gobbled it up.
				</translate>
			</p>
		</div>
		<div v-else class="-error alert alert-notice">
			<translate v-if="isExpired">Oh no! This login request has expired.</translate>
			<translate v-else-if="isRejected">Oh no! This login request got rejected.</translate>
			<app-button sparse class="-back-button" :to="{ name: 'auth.login' }">
				<translate>Go Back</translate>
			</app-button>
		</div>

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
		margin-top: 0
		margin-left: 5px
</style>
