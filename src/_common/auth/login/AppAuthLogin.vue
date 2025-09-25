<script lang="ts" setup>
import { toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { Navigate } from '../../navigate/navigate.service';
import { authOnLogin, getRedirectUrl, redirectToDashboard } from '../auth.service';
import AppAuthLoginForm from './AppAuthLoginForm.vue';

const props = defineProps({
	overlay: {
		type: Boolean,
	},
	redirectTo: {
		type: String,
		required: true,
	},
});

const router = useRouter();

const { redirectTo } = toRefs(props);

function onLoggedIn(_formModel: any, response: any) {
	// When we get a token, we are expected to solve a captcha and pass it back.
	if (response.token) {
		return;
	}

	// Otherwise, log them in!
	authOnLogin('email');

	const location = getRedirectUrl(redirectTo.value);
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
		query: { redirect: redirectTo?.value || undefined },
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
