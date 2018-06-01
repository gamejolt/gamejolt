import { Component } from 'vue-property-decorator';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../../../lib/gj-lib-client/components/route/route-component';
import { Route } from 'vue-router';
import { RouteState, RouteStore } from '../../../manage.store';
import { Api } from '../../../../../../../../lib/gj-lib-client/components/api/api.service';
import { Growls } from '../../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { LinkedAccount } from '../../../../../../../../lib/gj-lib-client/components/linked-account/linked-account.model';

@Component({
	name: 'RouteDashGamesManageGameLinkedAccountsLinkCallback',
})
export default class RouteDashGamesManageGameLinkedAccountsLinkCallback extends BaseRouteComponent {
	@RouteState game: RouteStore['game'];

	@RouteResolve()
	async routeResolve(this: undefined, route: Route) {
		// get game id from url path:
		const pathParts = window.location.pathname.split('/');
		const gameId = +pathParts[3]; // parse to int lol

		const url = RouteDashGamesManageGameLinkedAccountsLinkCallback.constructUrl(
			'/web/dash/developer/games/linked-accounts/link-callback/',
			gameId,
			route
		);
		// force POST
		return Api.sendRequest(url, {});
	}

	private static constructUrl(baseUrl: string, gameId: number, route: Route) {
		let url = baseUrl + gameId + '/' + route.params.provider;
		let firstParam = true;

		for (const param of ['oauth_verifier', 'state', 'code']) {
			const value = route.query[param];
			if (value) {
				url += (firstParam ? '?' : '&') + param + '=' + value;
				firstParam = false;
			}
		}

		return url;
	}

	routed($payload: any) {
		if (!this.game) {
			return;
		}

		const provider = this.$route.params.provider;
		const providerName = LinkedAccount.getProviderDisplayName(provider);
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
				case LinkedAccount.PROVIDER_FACEBOOK:
				case LinkedAccount.PROVIDER_GOOGLE:
				case LinkedAccount.PROVIDER_TWITCH:
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
			}
		}

		this.$router.push({
			name: 'dash.games.manage.game.linked-accounts',
		});
	}
}
