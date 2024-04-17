<script lang="ts">
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { showErrorGrowl } from '../../../../_common/growls/growls.service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../_common/route/legacy-route-component';
import AppGrecaptchaWidget from '../../../components/grecaptcha/widget/widget.vue';

@Options({
	name: 'RouteJoinCaptcha',
	components: {
		AppGrecaptchaWidget,
	},
})
@OptionsForLegacyRoute({
	reloadOn: 'always',
})
export default class RouteJoinCaptcha extends LegacyRouteComponent {
	authToken: string = null as any;

	serverErrors: {
		token?: boolean;
		captcha?: boolean;
		email?: boolean;
		username?: boolean;
		'rate-limit'?: boolean;
		error?: boolean;
	} | null = null;

	declare $refs: {
		recaptcha: HTMLDivElement;
	};

	get routeTitle() {
		return this.$gettext('Are you a robot?');
	}

	routeCreated() {
		const token = sessionStorage.getItem('signup-auth-token');
		if (!token) {
			showErrorGrowl({
				sticky: true,
				message: this.$gettext('Signup session expired!'),
			});
			this.$router.replace({ name: 'auth.join' });
			return;
		}

		this.authToken = token;
	}

	async onRecaptchaResponse(captchaResponse: string) {
		this.serverErrors = null;

		try {
			const response = await Api.sendRequest(
				'/web/auth/join',
				{
					token: this.authToken,
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
				this.$router.replace({ name: 'auth.join-almost' });
				return;
			}

			this.serverErrors = response.errors;
			if (this.serverErrors!.captcha) {
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
			this.serverErrors = { error: true };

			// Either no connection or something happened on the backend. This is most likely not a retriable error,
			// so clean up the signup credentials from session storage.
			sessionStorage.removeItem('signup-auth-token');
			sessionStorage.removeItem('signup-username');
			sessionStorage.removeItem('signup-password');
		}
	}

	retryJoin() {
		this.$router.push({ name: 'auth.join' });
	}
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
		<div class="alert alert-notice" v-if="serverErrors">
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
			<AppButton primary @click="retryJoin" v-if="!serverErrors['rate-limit']">
				<AppTranslate>Retry</AppTranslate>
			</AppButton>
		</div>
	</div>
</template>
