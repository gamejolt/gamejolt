import { Api } from 'game-jolt-frontend-lib/components/api/api.service';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { Component } from 'vue-property-decorator';
import AppGrecaptchaWidget from '../../../components/grecaptcha/widget/widget.vue';

@Component({
	name: 'RouteJoinCaptcha',
	components: {
		AppGrecaptchaWidget,
	},
})
export default class RouteJoinCaptcha extends BaseRouteComponent {
	authToken: string = null as any;

	serverErrors: {
		token?: boolean;
		captcha?: boolean;
		email?: boolean;
		username?: boolean;
		'rate-limit'?: boolean;
		error?: boolean;
	} | null = null;

	$refs!: {
		recaptcha: HTMLDivElement;
	};

	get routeTitle() {
		return this.$gettext('Are you a robot?');
	}

	routeCreated() {
		const token = sessionStorage.getItem('signup-auth-token');
		if (!token) {
			Growls.error({
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
