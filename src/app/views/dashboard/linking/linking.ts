import View from '!view!./linking.html';
import { Growls } from 'game-jolt-frontend-lib/components/growls/growls.service';
import { AppProgressPoller } from 'game-jolt-frontend-lib/components/progress/poller/poller';
import { BaseRouteComponent } from 'game-jolt-frontend-lib/components/route/route-component';
import { AppLoading } from 'game-jolt-frontend-lib/vue/components/loading/loading';
import { Component } from 'vue-property-decorator';
import * as _ClientMod from '../../../../_common/client/client.service';

let ClientMod: typeof _ClientMod | undefined;
if (GJ_IS_CLIENT) {
	ClientMod = require('../../../../_common/client/client.service');
}

@View
@Component({
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

	routeInit() {
		this.token = this.$route.query.token;
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

		// if (response.provider === 'facebook') {
		// } else if (response.provider === 'twitch') {
		// 	this.$router.push({
		// 		name: routeName,
		// 		params: { ...routeParams, provider: 'twitch' },
		// 		query: {
		// 			code: response.code,
		// 			state: this.token,
		// 		},
		// 	});
		// } else if (response.provider === 'twitter') {
		// 	this.$router.push({
		// 		name: routeName,
		// 		params: { ...routeParams, provider: 'twitter' },
		// 		query: {
		// 			code: response.code,
		// 			state: this.token,
		// 		},
		// 	});
		// } else if (response.provider === 'google') {
		// 	this.$router.push({
		// 		name: routeName,
		// 		params: { ...routeParams, provider: 'google' },
		// 		query: {
		// 			code: response.code,
		// 			state: this.token,
		// 		},
		// 	});
		// } else if (response.provider === 'youtube-channel') {
		// 	this.$router.push({
		// 		name: routeName,
		// 		params: { ...routeParams, provider: 'youtube-channel' },
		// 		query: {
		// 			code: response.code,
		// 			state: this.token,
		// 			channelTitle: response.channel ? response.channel.title : null,
		// 		},
		// 	});
		// }

		// Focus back to the Client.
		if (ClientMod) {
			ClientMod.Client.show();
		}
	}

	failed() {
		Growls.error(this.$gettext('Could not link.'), this.$gettext('Link Failed'));
	}
}
