import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { AppProgressPoller } from 'game-jolt-frontend-lib/components/progress/poller/poller';
import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import AppLoading from 'game-jolt-frontend-lib/vue/components/loading/loading.vue';
import { Component } from 'vue-property-decorator';
import * as _ClientMod from '../../../../../_common/client/client.service';

let ClientMod: typeof _ClientMod | undefined;
if (GJ_IS_CLIENT) {
	ClientMod = require('../../../../../_common/client/client.service');
}

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

	routeCreated() {
		this.token = this.$route.params.token;
	}

	completed(response: any) {
		// Redirect them off to complete their social login like normal.

		const validProviders = ['facebook', 'twitch', 'twitter', 'google'];
		const provider = response.provider;
		if (validProviders.indexOf(provider) !== -1) {
			this.$router.push({
				name: `auth.linked-account.${provider}.callback`,
				query: { code: response.code, state: this.token },
			});
		}

		this.isPolling = false;

		// Focus back to the Client.
		if (ClientMod) {
			ClientMod.Client.show();
		}
	}

	failed() {
		Growls.error(this.$gettext(`Couldn't authorize.`), this.$gettext(`Authorization Failed`));
		this.$router.push({ name: 'auth.login' });
	}
}
