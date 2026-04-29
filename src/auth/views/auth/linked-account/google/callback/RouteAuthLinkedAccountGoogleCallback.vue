<script lang="ts">
import { useRouter } from 'vue-router';

import AuthLinkedAccountProcessing from '~auth/views/auth/linked-account/_processing/AuthLinkedAccountProcessing.vue';
import { Api } from '~common/api/api.service';
import {
	authOnJoin,
	authOnLogin,
	consumeOAuthPendingToken,
	redirectToDashboard,
	redirectToOnboarding,
} from '~common/auth/auth.service';
import { showErrorGrowl } from '~common/growls/growls.service';
import { createAppRoute, defineAppRouteOptions } from '~common/route/route-component';
import { $gettext } from '~common/translate/translate.service';

export default {
	...defineAppRouteOptions({
		lazy: true,
		reloadOn: 'always',
		async resolver({ route }) {
			const { code, state } = route.query;

			const pendingToken = consumeOAuthPendingToken();
			if (!pendingToken || pendingToken !== state) {
				return { success: false, reason: 'invalid-state' };
			}

			return Api.sendRequest(
				'/web/auth/linked-accounts/link_callback/google?code=' + code + '&state=' + state,
				{}
			);
		},
	}),
};
</script>

<script lang="ts" setup>
const router = useRouter();

createAppRoute({
	onResolved({ payload }) {
		if (!payload.success) {
			switch (payload.reason) {
				case 'no-email':
					showErrorGrowl({
						sticky: true,
						message: $gettext(
							`Your Google account did not return an email address. Make sure you have verified it with Google.`
						),
					});
					break;

				case 'duplicate-email':
					showErrorGrowl({
						sticky: true,
						message: $gettext(
							`The email address on this Google account is already in use. Perhaps you already have an account?`
						),
					});
					break;

				case 'no-unique-username':
					showErrorGrowl({
						sticky: true,
						message: $gettext(
							`Could not create a username for your account. Perhaps you already have an account?`
						),
					});
					break;

				case 'invalid-google-account':
					showErrorGrowl({
						sticky: true,
						message: $gettext(
							'This Google account does not support Sign Up with Google.'
						),
					});
					break;

				default:
					showErrorGrowl({
						sticky: true,
						title: $gettext('Login Failed'),
						message: $gettext('Unable to log in with Google.'),
					});
					break;
			}
			router.push({ name: 'auth.join' });
			return;
		}

		if (payload.accountCreated) {
			authOnJoin('google');
			redirectToOnboarding();
			return;
		}

		authOnLogin('google');
		redirectToDashboard();
	},
});
</script>

<template>
	<AuthLinkedAccountProcessing />
</template>
