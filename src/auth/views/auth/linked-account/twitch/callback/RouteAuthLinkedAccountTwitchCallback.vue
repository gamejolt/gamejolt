<script lang="ts">
import { useRouter } from 'vue-router';
import { Api } from '../../../../../../_common/api/api.service';
import {
	authOnJoin,
	authOnLogin,
	redirectToDashboard,
	redirectToOnboarding,
} from '../../../../../../_common/auth/auth.service';
import { showErrorGrowl } from '../../../../../../_common/growls/growls.service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../_common/route/route-component';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import AuthLinkedAccountProcessing from '../../_processing/processing.vue';

export default {
	...defineAppRouteOptions({
		lazy: true,
		reloadOn: 'always',
		resolver({ route }) {
			const { code, state } = route.query;
			return Api.sendRequest(
				'/web/auth/linked-accounts/link_callback/twitch?code=' + code + '&state=' + state,
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
			if (payload.reason && payload.reason === 'no-email') {
				showErrorGrowl({
					sticky: true,
					message: $gettext(
						`Your Twitch account did not return an email address. Make sure you have verified it with Twitch.`
					),
				});
			} else if (payload.reason && payload.reason === 'duplicate-email') {
				showErrorGrowl({
					sticky: true,
					message: $gettext(
						`The email address on this Twitch account is already in use. Perhaps you already have an account?`
					),
				});
			} else if (payload.reason && payload.reason === 'no-unique-username') {
				showErrorGrowl({
					sticky: true,
					message: $gettext(
						`Could not create a username for your account. Perhaps you already have an account?`
					),
				});
			} else {
				showErrorGrowl({
					sticky: true,
					title: $gettext('Login Failed'),
					message: $gettext('Unable to log in with Twitch.'),
				});
			}
			router.push({ name: 'auth.join' });
			return;
		}

		if (payload.accountCreated) {
			authOnJoin('twitch');
			redirectToOnboarding();
			return;
		}

		authOnLogin('twitch');
		redirectToDashboard();
	},
});
</script>

<template>
	<AuthLinkedAccountProcessing />
</template>
