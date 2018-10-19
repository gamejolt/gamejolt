import View from '!view!./join-almost.html';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../lib/gj-lib-client/components/api/api.service';
import { Auth } from '../../../../lib/gj-lib-client/components/auth/auth.service';
import { Growls } from '../../../../lib/gj-lib-client/components/growls/growls.service';
import { AppProgressPoller } from '../../../../lib/gj-lib-client/components/progress/poller/poller';
import { BaseRouteComponent } from '../../../../lib/gj-lib-client/components/route/route-component';
import { AppJolticon } from '../../../../lib/gj-lib-client/vue/components/jolticon/jolticon';
import { AppLoading } from '../../../../lib/gj-lib-client/vue/components/loading/loading';

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

		// If it worked, redirect to dashboard. They're good to go!
		Auth.redirectDashboard();
	}
}
