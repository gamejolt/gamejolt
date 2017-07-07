import Vue from 'vue';
import { Component } from 'vue-property-decorator';
import * as View from '!view!./linking.html';
import { RouteResolve } from '../../../../../../lib/gj-lib-client/utils/router';
import { Meta } from '../../../../../../lib/gj-lib-client/components/meta/meta-service';
import { Growls } from '../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { AppProgressPoller } from '../../../../../../lib/gj-lib-client/components/progress/poller/poller';
import { AppLoading } from '../../../../../../lib/gj-lib-client/vue/components/loading/loading';

@View
@Component({
	components: {
		AppProgressPoller,
		AppLoading,
	},
})
export default class RouteDashAccountLinkedAccountsLinking extends Vue {
	token: string;

	@RouteResolve()
	routeEnter(this: undefined) {}

	routed() {
		Meta.title = this.$gettext('Waiting for Link');

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
		// TODO
		// Client.show();
	}

	failed() {
		Growls.error(
			this.$gettext('Could not link.'),
			this.$gettext('Link Failed')
		);

		this.$router.push({ name: 'dash.account.linked-accounts.list' });

		// $state.go('^');
	}
}
