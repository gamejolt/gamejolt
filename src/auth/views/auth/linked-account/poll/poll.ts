import { Component } from 'vue-property-decorator';
import View from '!view!./poll.html';

import { Growls } from '../../../../../lib/gj-lib-client/components/growls/growls.service';
import { AppProgressPoller } from '../../../../../lib/gj-lib-client/components/progress/poller/poller';
import { AppLoading } from '../../../../../lib/gj-lib-client/vue/components/loading/loading';
import { BaseRouteComponent } from '../../../../../lib/gj-lib-client/components/route/route-component';
import { ClientControl } from '../../../../../app/components/client/control/client.service';

@View
@Component({
	name: 'RouteAuthLinkedAccountPoll',
	components: {
		AppProgressPoller,
		AppLoading,
	},
})
export default class RouteAuthLinkedAccountPoll extends BaseRouteComponent {
	token = '';
	isPolling = true;

	get routeTitle() {
		return this.$gettext(`Waiting for Login`);
	}

	routeInit() {
		this.token = this.$route.query.token;
	}

	completed(response: any) {
		// Redirect them off to complete their social login like normal.
		if (response.provider === 'facebook') {
			this.$router.push({
				name: 'auth.linked-account.facebook.callback',
				query: { code: response.code, state: this.token },
			});
		} else if (response.provider === 'twitch') {
			this.$router.push({
				name: 'auth.linked-account.twitch.callback',
				query: { code: response.code, state: this.token },
			});
		} else if (response.provider === 'twitter') {
			this.$router.push({
				name: 'auth.linked-account.twitter.callback',
				query: {
					oauth_verifier: response['oauth-verifier'],
					state: this.token,
				},
			});
		} else if (response.provider === 'google') {
			this.$router.push({
				name: 'auth.linked-account.google.callback',
				query: { code: response.code, state: this.token },
			});
		}

		this.isPolling = false;

		// Focus back to the Client.
		// TODO(rewrite) test this
		if (GJ_IS_CLIENT) {
			const cc: typeof ClientControl = require('../../../../../app/components/client/control/client.service')
				.ClientControl;
			cc.show();
		}
	}

	failed() {
		Growls.error(this.$gettext(`Couldn't authorize.`), this.$gettext(`Authorization Failed`));
		this.$router.push({ name: 'auth.login' });
	}
}
