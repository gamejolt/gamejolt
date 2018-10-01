import View from '!view!./linking.html';
import { Component } from 'vue-property-decorator';

import { Growls } from '../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { AppProgressPoller } from '../../../../../../lib/gj-lib-client/components/progress/poller/poller';
import { BaseRouteComponent } from '../../../../../../lib/gj-lib-client/components/route/route-component';
import { AppLoading } from '../../../../../../lib/gj-lib-client/vue/components/loading/loading';
import * as _ClientMod from '../../../../../../_common/client/client.service';

let ClientMod: typeof _ClientMod | undefined;
if (GJ_IS_CLIENT) {
	ClientMod = require('../../../../../../_common/client/client.service');
}

@View
@Component({
	name: 'RouteDashAccountLinkedAccountsLinking',
	components: {
		AppProgressPoller,
		AppLoading,
	},
})
export default class RouteDashAccountLinkedAccountsLinking extends BaseRouteComponent {
	token!: string;

	get routeTitle() {
		return this.$gettext('Waiting for Link');
	}

	routeInit() {
		this.token = this.$route.query.token;
	}

	completed(response: any) {
		// Redirect them off to complete their social login like normal.
		if (response.provider === 'facebook') {
			this.$router.push({
				name: 'dash.account.linked-accounts.link-callback',
				params: { provider: 'facebook' },
				query: {
					code: response.code,
					state: this.token,
				},
			});
		} else if (response.provider === 'twitch') {
			this.$router.push({
				name: 'dash.account.linked-accounts.link-callback',
				params: { provider: 'twitch' },
				query: {
					code: response.code,
					state: this.token,
				},
			});
		} else if (response.provider === 'twitter') {
			this.$router.push({
				name: 'dash.account.linked-accounts.link-callback',
				params: { provider: 'twitter' },
				query: {
					oauth_verifier: response['oauth-verifier'],
					state: this.token,
				},
			});
		} else if (response.provider === 'google') {
			this.$router.push({
				name: 'dash.account.linked-accounts.link-callback',
				params: { provider: 'google' },
				query: {
					code: response.code,
					state: this.token,
				},
			});
		} else if (response.provider === 'youtube-channel') {
			this.$router.push({
				name: 'dash.account.linked-accounts.link-callback',
				params: { provider: 'youtube-channel' },
				query: {
					code: response.code,
					state: this.token,
					channelTitle: response.channel ? response.channel.title : null,
				},
			});
		}

		// Focus back to the Client.
		if (ClientMod) {
			ClientMod.Client.show();
		}
	}

	failed() {
		Growls.error(this.$gettext('Could not link.'), this.$gettext('Link Failed'));

		this.$router.push({ name: 'dash.account.linked-accounts.list' });
	}
}
