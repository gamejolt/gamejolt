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

	onSync(e: Event) {
		console.log('EMIT SYNC', e);
	}

	onLink(e: Event, provider: Provider) {
		LinkedAccounts.link(
			this.$router,
			provider,
			'/web/dash/developer/games/linked-accounts/link/' + this.game.id + '/'
		);
	}
}
