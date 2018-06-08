import { Component } from 'vue-property-decorator';
import View from '!view!./linked-accounts.html?style=./linked-accounts.styl';

import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { AppState, AppStore } from '../../../../../lib/gj-lib-client/vue/services/app/app-store';
import { RouteMutation, RouteStore } from '../account.store';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { YoutubeChannel } from '../../../../../lib/gj-lib-client/components/youtube/channel/channel-model';
import { AppLinkedAccount } from '../../../../../lib/gj-lib-client/components/linked-account/linked-account';
import {
	LinkedAccount,
	Provider,
} from '../../../../../lib/gj-lib-client/components/linked-account/linked-account.model';
import { LinkedAccounts } from '../../../../../lib/gj-lib-client/components/linked-account/linked-accounts.service';

@View
@Component({
	name: 'RouteDashAccountLinkedAccounts',
	components: {
		AppLinkedAccount,
	},
})
export default class RouteDashAccountLinkedAccounts extends BaseRouteComponent {
	@AppState user: AppStore['user'];
	@RouteMutation setHeading: RouteStore['setHeading'];

	accounts: LinkedAccount[] = [];
	channels: YoutubeChannel[] = [];

	get facebookAccount() {
		return this.getAccount(LinkedAccount.PROVIDER_FACEBOOK);
	}

	get twitterAccount() {
		return this.getAccount(LinkedAccount.PROVIDER_TWITTER);
	}

	get googleAccount() {
		return this.getAccount(LinkedAccount.PROVIDER_GOOGLE);
	}

	get twitchAccount() {
		return this.getAccount(LinkedAccount.PROVIDER_TWITCH);
	}

	getAccount(provider: string) {
		if (this.accounts) {
			for (const account of this.accounts) {
				if (account.provider === provider) {
					return account;
				}
			}
		}
		return null;
	}

	@RouteResolve()
	routeResolve(this: undefined) {
		return Api.sendRequest('/web/dash/linked-accounts');
	}

	get routeTitle() {
		return this.$gettext('Linked Accounts');
	}

	routed($payload: any) {
		this.setHeading(this.$gettext('Linked Accounts'));
		this.channels = YoutubeChannel.populate($payload.channels);
		this.accounts = LinkedAccount.populate($payload.accounts);
	}

	async onLink(_e: Event, provider: Provider) {
		await LinkedAccounts.link(this.$router, provider, '/web/dash/linked-accounts/link/');
	}
}
