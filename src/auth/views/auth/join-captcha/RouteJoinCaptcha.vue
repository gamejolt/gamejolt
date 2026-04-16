<script lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import AppGrecaptchaWidget from '~auth/components/grecaptcha/widget/AppGrecaptchaWidget.vue';
import { Api } from '~common/api/api.service';
import AppButton from '~common/button/AppButton.vue';
import { showErrorGrowl } from '~common/growls/growls.service';
import { defineAppRouteOptions } from '~common/route/route-component';
import { createAppRoute } from '~common/route/route-component';
import AppTranslate from '~common/translate/AppTranslate.vue';
import { $gettext } from '~common/translate/translate.service';

export default {
	name: 'RouteJoinCaptcha',
	...defineAppRouteOptions({
		reloadOn: 'always',
	}),
};
</script>

<script lang="ts" setup>
const router = useRouter();

type ServerErrors = {
	token?: boolean;
	captcha?: boolean;
	email?: boolean;
	username?: boolean;
	'rate-limit'?: boolean;
	error?: boolean;
} | null;

const authToken = ref('');
const serverErrors = ref<ServerErrors>(null);

createAppRoute({
	routeTitle: $gettext('Are you a robot?'),
	onInit() {
		const token = sessionStorage.getItem('signup-auth-token');
		if (!token) {
			showErrorGrowl({
				sticky: true,
				message: $gettext('Signup session expired!'),
			});
			router.replace({ name: 'auth.join' });
			return;
		}

		authToken.value = token;
	},
});

async function onRecaptchaResponse(captchaResponse: string) {
	serverErrors.value = null;

	try {
		const response = await Api.sendRequest(
			'/web/auth/join',
			{
				token: authToken.value,
				captcha: captchaResponse,
			},
			{
				detach: true,
			}
		);

		if (response.success) {
			// At this point it is guaranteed that the auth token has been consumed, so clear it from session storage.
			// If this route is reloaded, it'll redirect back to /join saying the signup session has expired.
			sessionStorage.removeItem('signup-auth-token');
			router.replace({ name: 'auth.join-almost' });
			return;
		}

		serverErrors.value = response.errors;
		if (serverErrors.value!.captcha) {
			grecaptcha.reset();
		} else {
			// If the error is not retriable (currently only captcha is), clean up credentials from session storage.
			// We don't want these to linger around if we can help it.
			sessionStorage.removeItem('signup-auth-token');
			sessionStorage.removeItem('signup-username');
			sessionStorage.removeItem('signup-password');
		}
	} catch (err) {
		console.error(err);
		serverErrors.value = { error: true };

		// Either no connection or something happened on the backend. This is most likely not a retriable error,
		// so clean up the signup credentials from session storage.
		sessionStorage.removeItem('signup-auth-token');
		sessionStorage.removeItem('signup-username');
		sessionStorage.removeItem('signup-password');
	}
}

function retryJoin() {
	router.push({ name: 'auth.join' });
}
</script>

<template>
	<div class="anim-fade-in-up">
		<h2 class="section-header">
			<AppTranslate>Are you a robot?</AppTranslate>
			<br />
			(ノಠ益ಠ)ノ彡┻━┻
		</h2>

		<br />
		<AppGrecaptchaWidget @response="onRecaptchaResponse" />
		<br />
		<div v-if="serverErrors" class="alert alert-notice">
			<AppTranslate v-if="serverErrors.token">
				Oh no, your sign-up session has expired!
			</AppTranslate>
			<AppTranslate v-else-if="serverErrors.captcha">
				Oh no, your captcha couldn't be validated. Please try again.
			</AppTranslate>
			<AppTranslate v-else-if="serverErrors.email || serverErrors.username">
				Oh no, someone already registered with your email or username! Gotta go fast.
			</AppTranslate>
			<AppTranslate v-else-if="serverErrors['rate-limit']">
				You must wait 15 minutes before creating another account.
			</AppTranslate>
			<AppTranslate v-else> Something weird happened! </AppTranslate>
			<br />
			<AppButton v-if="!serverErrors['rate-limit']" primary @click="retryJoin">
				<AppTranslate>Retry</AppTranslate>
			</AppButton>
		</div>
	</div>
</template>
