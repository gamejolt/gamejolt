<script lang="ts" setup>
import { useRouter } from 'vue-router';

import { authOnLogin, getRedirectUrl, redirectToDashboard } from '~common/auth/auth.service';
import AppAuthLoginForm from '~common/auth/login/AppAuthLoginForm.vue';
import { Navigate } from '~common/navigate/navigate.service';

type Props = {
	overlay?: boolean;
	redirectTo: string;
};
const { overlay, redirectTo } = defineProps<Props>();

const router = useRouter();

function onLoggedIn(_formModel: any, response: any) {
	// When we get a token, we are expected to solve a captcha and pass it back.
	if (response.token) {
		return;
	}

	// Otherwise, log them in!
	authOnLogin('email');

	const location = getRedirectUrl(redirectTo);
	if (location) {
		if (!GJ_IS_DESKTOP_APP) {
			Navigate.goto(location);
			return;
		}

		console.error(
			'Post auth redirects are not supported in client. Will redirect to dashboard instead.'
		);
	}

	redirectToDashboard();
}

function onNeedsApprovedLogin(loginPollingToken: string) {
	sessionStorage.setItem('login-polling-token', loginPollingToken);
	router.push({
		name: 'auth.approve-login',
		query: { redirect: redirectTo || undefined },
	});
}
</script>

<template>
	<div class="auth-login">
		<AppAuthLoginForm
			:overlay="overlay"
			@submit="onLoggedIn"
			@needs-approved-login="onNeedsApprovedLogin"
		/>
	</div>
</template>
