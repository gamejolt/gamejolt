import { Route } from 'vue-router';
import { Component } from 'vue-property-decorator';
import View from '!view!./linked-accounts.html?style=./linked-accounts.styl';

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
import { ModalFacebookPageSelector } from '../../../../../../../lib/gj-lib-client/components/linked-account/facebook-page-selector-modal/facebook-page-selector-modal-service';

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

	get tumblrAccount() {
		if (this.accounts) {
			for (const account of this.accounts) {
				if (account.provider === LinkedAccount.PROVIDER_TUMBLR) {
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

	async onSelectFacebookPage() {
		if (!this.facebookAccount) {
			return;
		}

		const modalResult = await ModalFacebookPageSelector.show(
			this.$gettext('Select a page you want to post to with this account'),
			this.facebookAccount,
			this.$gettext('Select Facebook Page'),
			'ok'
		);

		if (modalResult) {
			// do not send if the page was already selected
			// check id AND name to make sure they didn't change the name and want to sync it
			if (
				this.facebookAccount.facebookSelectedPage &&
				modalResult.id === this.facebookAccount.facebookSelectedPage.id &&
				modalResult.name === this.facebookAccount.facebookSelectedPage.name
			) {
				return;
			}

			const payload = await Api.sendRequest(
				'/web/dash/developer/games/linked-accounts/link-facebook-page/' +
					this.game.id +
					'/' +
					this.facebookAccount.id +
					'/' +
					modalResult.id
			);

			if (payload.success) {
				if (payload.accounts) {
					// update accounts
					this.accounts = LinkedAccount.populate(payload.accounts);
				}

				Growls.success(
					this.$gettextInterpolate('Changed the selected Facebook page to %{ title }.', {
						title: modalResult.name,
					}),
					this.$gettext('Select Facebook Page')
				);
			} else {
				Growls.error(
					this.$gettext(
						'Failed to change to new Facebook page. Try to Sync your Facebook account.'
					)
				);
			}
		}
	}

	async onUnlinkFacebookPage() {
		if (!this.facebookAccount || !this.facebookAccount.facebookSelectedPage) {
			return;
		}

		const tempPageName = this.facebookAccount.facebookSelectedPage.name;

		const payload = await Api.sendRequest(
			'/web/dash/developer/games/linked-accounts/unlink-facebook-page/' +
				this.game.id +
				'/' +
				this.facebookAccount.id
		);

		if (payload.success) {
			if (payload.accounts) {
				// update accounts
				this.accounts = LinkedAccount.populate(payload.accounts);
			}

			Growls.success(
				this.$gettextInterpolate(
					`The Facebook Page %{ title } has been unlinked from %{ game }.`,
					{
						title: tempPageName,
						game: this.game.title,
					}
				),
				this.$gettext('Facebook Page Unlinked')
			);
		} else {
			Growls.error(this.$gettext(`Could not unlink your Facebook page.`));
		}
	}
}
