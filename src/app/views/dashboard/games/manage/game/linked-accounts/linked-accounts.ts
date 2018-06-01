import { Route } from 'vue-router';
import { Component } from 'vue-property-decorator';
import View from '!view!./linked-accounts.html';

import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../../lib/gj-lib-client/components/route/route-component';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { RouteState, RouteStore } from '../../manage.store';
import { AppLinkedAccount } from '../../../../../../../lib/gj-lib-client/components/linked-account/linked-account';
import {
	LinkedAccount,
	Provider,
} from '../../../../../../../lib/gj-lib-client/components/linked-account/linked-account.model';
import { LinkedAccounts } from '../../../../../../../lib/gj-lib-client/components/linked-account/linked-accounts.service';
import { Growls } from '../../../../../../../lib/gj-lib-client/components/growls/growls.service';

@View
@Component({
	name: 'RouteDashGamesManageGameLinkedAccounts',
	components: {
		AppLinkedAccount,
	},
})
export default class RouteDashGamesManageGameLinkedAccounts extends BaseRouteComponent {
	@RouteState game: RouteStore['game'];

	accounts: LinkedAccount[] = [];

	@RouteResolve()
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest('/web/dash/developer/games/linked-accounts/' + route.params.id);
	}

	get routeTitle() {
		if (this.game) {
			return this.$gettextInterpolate('Edit Linked Accounts for %{ game }', {
				game: this.game.title,
			});
		}
		return null;
	}

	get twitterAccount() {
		if (this.accounts) {
			for (const account of this.accounts) {
				if (account.provider === LinkedAccount.PROVIDER_TWITTER) {
					return account;
				}
			}
		}
		return null;
	}

	get facebookAccount() {
		if (this.accounts) {
			for (const account of this.accounts) {
				if (account.provider === LinkedAccount.PROVIDER_FACEBOOK) {
					return account;
				}
			}
		}
		return null;
	}

	routed($payload: any) {
		this.accounts = LinkedAccount.populate($payload.accounts);
	}

	async onLink(_e: Event, provider: Provider) {
		await LinkedAccounts.link(
			this.$router,
			provider,
			'/web/dash/developer/games/linked-accounts/link/' + this.game.id + '/'
		);
	}

	async onUnlink(_e: Event, provider: Provider) {
		// TODO: client
		const response = await Api.sendRequest(
			'/web/dash/developer/games/linked-accounts/unlink/' + this.game.id + '/' + provider
		);

		const providerName = LinkedAccount.getProviderDisplayName(provider);
		if (response.success) {
			this.accounts = LinkedAccount.populate(response.accounts);
			Growls.success(
				this.$gettextInterpolate(
					`Your %{ provider } account has been unlinked from %{ game }.`,
					{
						provider: providerName,
						game: this.game.title,
					}
				),
				this.$gettext('Account Unlinked')
			);
		} else {
			Growls.error(
				this.$gettextInterpolate(`Could not unlink your %{ provider } account.`, {
					provider: providerName,
				})
			);
		}
	}
}
