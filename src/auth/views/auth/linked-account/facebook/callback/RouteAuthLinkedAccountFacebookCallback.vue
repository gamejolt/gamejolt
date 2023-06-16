<script lang="ts">
import { useRouter } from 'vue-router';
import { Api } from '../../../../../../_common/api/api.service';
import {
	authOnJoin,
	authOnLogin,
	redirectToDashboard,
	redirectToOnboarding,
} from '../../../../../../_common/auth/auth.service';
import { configInitialPackWatermark } from '../../../../../../_common/config/config.service';
import { showErrorGrowl } from '../../../../../../_common/growls/growls.service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../_common/route/route-component';
import { useCommonStore } from '../../../../../../_common/store/common-store';
import { $gettext } from '../../../../../../_common/translate/translate.service';
import AuthLinkedAccountProcessing from '../../_processing/processing.vue';

export default {
	...defineAppRouteOptions({
		lazy: true,
		resolver({ route }) {
			const { code, state } = route.query;
			return Api.sendRequest(
				'/web/auth/linked-accounts/link_callback/facebook?code=' + code + '&state=' + state,
				{}
			);
		},
	}),
};
</script>

<script lang="ts" setup>
const { setInitialPackWatermarkStorageValue } = useCommonStore();

const router = useRouter();

createAppRoute({
	onResolved({ payload }) {
		if (!payload.success) {
			if (payload.reason && payload.reason === 'no-email') {
				showErrorGrowl({
					sticky: true,
					message: $gettext(
						`Your Facebook account did not return an email address. Make sure you have verified it with Facebook.`
					),
				});
			} else if (payload.reason && payload.reason === 'duplicate-email') {
				showErrorGrowl({
					sticky: true,
					message: $gettext(
						`The email address on this Facebook account is already in use. Perhaps you already have an account?`
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
					message: $gettext('Unable to log in with Facebook.'),
				});
			}
			router.push({ name: 'auth.join' });
			return;
		}

		if (payload.accountCreated) {
			authOnJoin('facebook');
			redirectToOnboarding();
			if (configInitialPackWatermark.value) {
				setInitialPackWatermarkStorageValue(true);
			}
			return;
		}

		authOnLogin('facebook');
		redirectToDashboard();
	},
});
</script>

<template>
	<AuthLinkedAccountProcessing />
</template>
