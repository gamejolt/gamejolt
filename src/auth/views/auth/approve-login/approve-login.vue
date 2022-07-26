<script lang="ts">
import { Options } from 'vue-property-decorator';
import { RouteLocationRedirect } from '../../../../utils/router';
import {
	authOnLogin,
	getRedirectUrl,
	redirectToDashboard,
} from '../../../../_common/auth/auth.service';
import AppLoading from '../../../../_common/loading/AppLoading.vue';
import { Navigate } from '../../../../_common/navigate/navigate.service';
import { AppProgressPoller } from '../../../../_common/progress/poller/poller';
import { BaseRouteComponent, OptionsForRoute } from '../../../../_common/route/route-component';

@Options({
	name: 'RouteApproveLogin',
	components: {
		AppProgressPoller,
		AppLoading,
	},
})
@OptionsForRoute({
	async resolver({ route }) {
		if (!import.meta.env.SSR) {
			const pollingToken = sessionStorage.getItem('login-polling-token');
			if (!pollingToken) {
				return new RouteLocationRedirect({
					name: 'auth.login',
					query: { redirect: route.query.redirect || undefined },
				});
			}

			sessionStorage.removeItem('login-polling-token');
			return pollingToken;
		}
		return null;
	},
})
export default class RouteApproveLogin extends BaseRouteComponent {
	pollingToken: string | null = null;

	isExpired = false;
	isRejected = false;

	get routeTitle() {
		return this.$gettext('Approve Login Location');
	}

	get isPolling() {
		return !this.isExpired && !this.isRejected;
	}

	routeResolved(pollingToken: string | null) {
		this.pollingToken = pollingToken;
	}

	async onApproved() {
		authOnLogin('email');

		const location = getRedirectUrl(this.$route.query.redirect as string);
		if (location) {
			Navigate.goto(location);
			return;
		}

		redirectToDashboard();
	}

	async onError(e: any) {
		if (e instanceof Error) {
			throw e;
		}

		if (e.status && e.status === 'error' && e.reason) {
			switch (e.reason) {
				case 'expired':
					this.isExpired = true;
					return;

				case 'rejected':
					this.isRejected = true;
					return;
			}
		}

		console.error('Invalid looking response from polling blocked login', e);
	}
}
</script>

<template>
	<div class="anim-fade-in-up">
		<h2 class="section-header">
			<AppTranslate>You must approve this device</AppTranslate>
		</h2>

		<p>
			<AppTranslate>
				We've sent you an email with a link to approve this device. We are doing this in
				order to protect your account.
			</AppTranslate>
		</p>

		<div v-if="isPolling" class="-polling">
			<p class="small text-muted">
				<AppTranslate>
					If you don't see the email within a few minutes, please check your spam folder.
					It might have gobbled it up.
				</AppTranslate>
			</p>
		</div>
		<template v-else>
			<div class="-error alert alert-notice">
				<AppTranslate v-if="isExpired">
					Oh no! This login request has expired. Please try logging in again.
				</AppTranslate>
				<AppTranslate v-else-if="isRejected">
					Oh no! This login request got rejected.
				</AppTranslate>
			</div>

			<AppButton class="-back-button" :to="{ name: 'auth.login' }" block>
				<AppTranslate>Go Back</AppTranslate>
			</AppButton>
		</template>

		<!--
			We poll to see if their account gets authorized or not.
			When it does, we can log them in.
		-->
		<AppProgressPoller
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
