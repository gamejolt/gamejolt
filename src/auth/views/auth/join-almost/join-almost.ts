import { Component } from 'vue-property-decorator';
import { Api } from '../../../../_common/api/api.service';
import { Auth } from '../../../../_common/auth/auth.service';
import { Growls } from '../../../../_common/growls/growls.service';
import AppLoading from '../../../../_common/loading/loading.vue';
import { AppProgressPoller } from '../../../../_common/progress/poller/poller';
import { BaseRouteComponent } from '../../../../_common/route/route-component';

@Component({
	name: 'RouteJoinAlmost',
	components: {
		AppProgressPoller,
		AppLoading,
	},
})
export default class RouteJoinAlmost extends BaseRouteComponent {
	username: string | null = null;
	password: string | null = null;

	get routeTitle() {
		return this.$gettext('auth.join.almost.page_title');
	}

	get isGamejoltSignup() {
		return this.username || this.password;
	}

	routeCreated() {
		this.username = sessionStorage.getItem('signup-username');
		this.password = sessionStorage.getItem('signup-password');
	}

	async onAuthorized() {
		if (!this.isGamejoltSignup) {
			return;
		}

		// Now that they're authorized, we try to log them in with the credentials they used to sign up.
		const response = await Api.sendRequest('/web/auth/login', {
			username: this.username,
			password: this.password,
		});

		sessionStorage.removeItem('signup-username');
		sessionStorage.removeItem('signup-password');

		if (!response.success) {
			Growls.error({
				message: this.$gettext(`Couldn't log you in for some reason.`),
				sticky: true,
			});
			return;
		}

		// If it worked, redirect to onbaording flow. They're good to go!
		Auth.redirectOnboarding();
	}
}
