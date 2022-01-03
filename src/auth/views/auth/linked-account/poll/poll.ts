import { Options } from 'vue-property-decorator';
import { Client } from '../../../../../_common/client/client-exports';
import { showErrorGrowl } from '../../../../../_common/growls/growls.service';
import AppLoading from '../../../../../_common/loading/loading.vue';
import { AppProgressPoller } from '../../../../../_common/progress/poller/poller';
import { BaseRouteComponent } from '../../../../../_common/route/route-component';

@Options({
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
		Client?.show();
	}

	failed() {
		showErrorGrowl(this.$gettext(`Couldn't authorize.`), this.$gettext(`Authorization Failed`));
		this.$router.push({ name: 'auth.login' });
	}
}
