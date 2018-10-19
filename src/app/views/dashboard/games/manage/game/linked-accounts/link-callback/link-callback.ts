import { CreateElement } from 'vue';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Api } from '../../../../../../../../lib/gj-lib-client/components/api/api.service';
import { Growls } from '../../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import {
	getLinkedAccountProviderDisplayName,
	LinkedAccount,
} from '../../../../../../../../lib/gj-lib-client/components/linked-account/linked-account.model';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../../../../lib/gj-lib-client/components/route/route-component';
import { RouteStore, RouteStoreModule } from '../../../manage.store';

@Component({
	name: 'RouteDashGamesManageGameLinkedAccountsLinkCallback',
})
@RouteResolver({
	resolver({ route }) {
		const url = RouteDashGamesManageGameLinkedAccountsLinkCallback.constructUrl(
			'/web/dash/linked-accounts/link-callback/',
			parseInt(route.params.id, 10),
			route
		);

		return Api.sendRequest(url, {});
	},
})
export default class RouteDashGamesManageGameLinkedAccountsLinkCallback extends BaseRouteComponent {
	@RouteStoreModule.State
	game!: RouteStore['game'];

	private static constructUrl(baseUrl: string, gameId: number, route: Route) {
		let url = baseUrl + route.params.provider;
		let firstParam = true;

		for (const param of ['oauth_verifier', 'state', 'code']) {
			const value = route.query[param];
			if (value) {
				url += (firstParam ? '?' : '&') + param + '=' + value;
				firstParam = false;
			}
		}

		url += (firstParam ? '?' : '&') + 'resource=Game&resourceId=' + gameId.toString();

		return url;
	}

	routeResolved($payload: any) {
		if (!this.game) {
			return;
		}

		const provider = this.$route.params.provider;
		const providerName = getLinkedAccountProviderDisplayName(provider);
		if (!$payload.success || !$payload.account) {
			Growls.error(
				this.$gettextInterpolate('Unable to link your %{ provider } account to %{ game }', {
					provider: providerName,
					game: this.game.title,
				})
			);
		} else {
			const account = new LinkedAccount($payload.account);

			switch (provider) {
				case LinkedAccount.PROVIDER_TWITTER:
					Growls.success(
						this.$gettextInterpolate(
							'Your %{ provider } account (@%{ name }) has been linked to %{ game }',
							{
								provider: providerName,
								name: account.name,
								game: this.game.title,
							}
						),
						this.$gettext('Account Linked')
					);
					break;
				case LinkedAccount.PROVIDER_FACEBOOK:
				case LinkedAccount.PROVIDER_GOOGLE:
				case LinkedAccount.PROVIDER_TWITCH:
				case LinkedAccount.PROVIDER_TUMBLR:
					Growls.success(
						this.$gettextInterpolate(
							'Your %{ provider } account (%{ name }) has been linked to %{ game }',
							{
								provider: providerName,
								name: account.name,
								game: this.game.title,
							}
						),
						this.$gettext('Account Linked')
					);
					break;
			}
		}

		this.$router.push({
			name: 'dash.games.manage.game.linked-accounts',
		});
	}

	render(h: CreateElement) {
		return h('div');
	}
}
