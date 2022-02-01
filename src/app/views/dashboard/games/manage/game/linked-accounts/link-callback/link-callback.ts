import { h } from 'vue';
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { RouteLocationNormalized } from 'vue-router';
import { Api } from '../../../../../../../../_common/api/api.service';
import {
	showErrorGrowl,
	showSuccessGrowl,
} from '../../../../../../../../_common/growls/growls.service';
import {
	getLinkedAccountProviderDisplayName,
	LinkedAccount,
} from '../../../../../../../../_common/linked-account/linked-account.model';
import {
	BaseRouteComponent,
	OptionsForRoute,
} from '../../../../../../../../_common/route/route-component';
import { useGameDashRouteController } from '../../../manage.store';

@Options({
	name: 'RouteDashGamesManageGameLinkedAccountsLinkCallback',
})
@OptionsForRoute({
	resolver({ route }) {
		const url = RouteDashGamesManageGameLinkedAccountsLinkCallback.constructUrl(
			'/web/dash/linked-accounts/link-callback/',
			parseInt(route.params.id as string, 10),
			route
		);

		return Api.sendRequest(url, {});
	},
})
export default class RouteDashGamesManageGameLinkedAccountsLinkCallback extends BaseRouteComponent {
	routeStore = setup(() => useGameDashRouteController()!);

	get game() {
		return this.routeStore.game!;
	}

	private static constructUrl(baseUrl: string, gameId: number, route: RouteLocationNormalized) {
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

		const provider = this.$route.params.provider as string;
		const providerName = getLinkedAccountProviderDisplayName(provider);
		if (!$payload.success || !$payload.account) {
			showErrorGrowl(
				this.$gettextInterpolate('Unable to link your %{ provider } account to %{ game }', {
					provider: providerName,
					game: this.game.title,
				})
			);
		} else {
			const account = new LinkedAccount($payload.account);

			switch (provider) {
				case LinkedAccount.PROVIDER_TWITTER:
					showSuccessGrowl(
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
					showSuccessGrowl(
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

	render() {
		return h('div');
	}
}
