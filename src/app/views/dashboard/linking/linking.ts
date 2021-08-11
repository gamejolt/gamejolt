import { Options } from 'vue-property-decorator';
import * as _ClientMod from '../../../../_common/client/client.service';
import { Growls } from '../../../../_common/growls/growls.service';
import AppLoading from '../../../../_common/loading/loading.vue';
import { AppProgressPoller } from '../../../../_common/progress/poller/poller';
import { BaseRouteComponent } from '../../../../_common/route/route-component';

let ClientMod: typeof _ClientMod | undefined;
if (GJ_IS_CLIENT) {
	ClientMod = require('../../../../_common/client/client.service');
}

@Options({
	name: 'RouteDashLinking',
	components: {
		AppProgressPoller,
		AppLoading,
	},
})
export default class RouteDashLinking extends BaseRouteComponent {
	token!: string;

	get routeTitle() {
		return this.$gettext('Waiting for Link');
	}

	routeCreated() {
		this.token = this.$route.query.token as string;
	}

	completed(response: any) {
		const routeName =
			response.resource === 'Game'
				? 'dash.games.manage.game.linked-accounts.link-callback'
				: 'dash.account.linked-accounts.link-callback';

		const routeParams: { [k: string]: string } =
			response.resource === 'Game' ? { id: response['resource-id'] } : {};

		// Redirect them off to complete their social login like normal.
		this.$router.push({
			name: routeName,
			params: { ...routeParams, provider: response.provider },
			query: {
				code: response.code,
				state: this.token,
				channelTitle: response.channel ? response.channel.title : null,
			},
		});

		// Focus back to the Client.
		if (ClientMod) {
			ClientMod.Client.show();
		}
	}

	failed() {
		Growls.error({
			message: this.$gettext('Could not link.'),
			title: this.$gettext('Link Failed'),
			sticky: true,
		});

		// Focus back to the Client.
		if (ClientMod) {
			ClientMod.Client.show();
		}
	}
}
