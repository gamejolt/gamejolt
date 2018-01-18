import { Component } from 'vue-property-decorator';
import { State, Mutation } from 'vuex-class';
import View from '!view!./join-almost.html';

import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Auth } from '../../../../lib/gj-lib-client/components/auth/auth.service';
import { AppProgressPoller } from '../../../../lib/gj-lib-client/components/progress/poller/poller';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { Store } from '../../../store/index';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';

@View
@Component({
	name: 'RouteJoinAlmost',
	components: {
		AppProgressPoller,
		AppLoading,
		AppJolticon,
	},
})
export default class RouteJoinAlmost extends BaseRouteComponent {
	@State credentials: Store['credentials'];

	doingCaptcha = true;
	recaptchaReady = false;
	recaptchaInterval: NodeJS.Timer = null as any;

	serverErrors: {
		token: boolean;
		captcha: boolean;
		email: boolean;
		username: boolean;
	} = null as any;

	$refs: {
		recaptcha: HTMLDivElement;
	};

	get routeTitle() {
		return this.$gettext('auth.join.almost.page_title');
	}

	routeInit() {
		this.doingCaptcha = !!this.$route.params.token;

		this.recaptchaInterval = setInterval(() => {
			if (grecaptcha) {
				this.recaptchaReady = true;
				clearInterval(this.recaptchaInterval);

				setImmediate(() => {
					grecaptcha.render(this.$refs.recaptcha, {
						// TODO(spam) pull this from config / webpack.
						sitekey: '6LcwTkEUAAAAAHTT67TB8gkM0ft5hUzz_r_tFFaT',
						theme: 'dark',
						callback: response => this.onRecaptcha(response),
					});
				});
			}
		}, 1000);
	}

	async onRecaptcha(captchaResponse: string) {
		this.serverErrors = null as any;

		const response = await Api.sendRequest('/web/auth/join', {
			token: this.$route.params.token,
			captcha: captchaResponse,
		});

		console.log(response);
		if (response.success) {
			this.doingCaptcha = false;
			return;
		}

		this.serverErrors = response.errors;
		if (this.serverErrors.captcha) {
			grecaptcha.reset();
		}
	}

	gotoJoin() {
		this.$router.push({ name: 'auth.join' });
	}

	async onAuthorized() {
		if (!this.credentials) {
			return;
		}

		// Now that they're authorized, we try to log them in with the credentials they used to sign up.
		const response = await Api.sendRequest('/web/auth/login', this.credentials);
		if (!response.success) {
			Growls.error({
				message: this.$gettext(`Couldn't log you in for some reason.`),
				sticky: true,
			});
			return;
		}

		// If it worked, redirect to dashboard. They're good to go!
		Auth.redirectDashboard();
	}
}
