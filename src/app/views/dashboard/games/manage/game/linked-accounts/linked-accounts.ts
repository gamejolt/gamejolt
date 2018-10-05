import View from '!view!./linked-accounts.html?style=./linked-accounts.styl';
import { Component } from 'vue-property-decorator';
import { Route } from 'vue-router';
import { Api } from '../../../../../../../lib/gj-lib-client/components/api/api.service';
import { Growls } from '../../../../../../../lib/gj-lib-client/components/growls/growls.service';
import { ModalFacebookPageSelector } from '../../../../../../../lib/gj-lib-client/components/linked-account/facebook-page-selector-modal/facebook-page-selector-modal-service';
import { AppLinkedAccount } from '../../../../../../../lib/gj-lib-client/components/linked-account/linked-account';
import {
	getLinkedAccountProviderDisplayName,
	LinkedAccount,
	Provider,
} from '../../../../../../../lib/gj-lib-client/components/linked-account/linked-account.model';
import { LinkedAccounts } from '../../../../../../../lib/gj-lib-client/components/linked-account/linked-accounts.service';
import { ModalTumblrBlogSelector } from '../../../../../../../lib/gj-lib-client/components/linked-account/tumblr-blog-selector-modal/tumblr-blog-selector-modal-service';
import { ModalConfirm } from '../../../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolve,
} from '../../../../../../../lib/gj-lib-client/components/route/route-component';
import { RouteState, RouteStore } from '../../manage.store';

@View
@Component({
	name: 'RouteDashGamesManageGameLinkedAccounts',
	components: {
		AppLinkedAccount,
	},
})
export default class RouteDashGamesManageGameLinkedAccounts extends BaseRouteComponent {
	@RouteState
	game!: RouteStore['game'];

	accounts: LinkedAccount[] = [];

	@RouteResolve()
	routeResolve(this: undefined, route: Route) {
		return Api.sendRequest(
			'/web/dash/linked-accounts?resource=Game&resourceId=' + route.params.id
		);
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
		return this.getAccount(LinkedAccount.PROVIDER_TWITTER);
	}

	get facebookAccount() {
		return this.getAccount(LinkedAccount.PROVIDER_FACEBOOK);
	}

	get tumblrAccount() {
		return this.getAccount(LinkedAccount.PROVIDER_TUMBLR);
	}

	get discordAccount() {
		return this.getAccount(LinkedAccount.PROVIDER_DISCORD);
	}

	routed($payload: any) {
		this.accounts = LinkedAccount.populate($payload.accounts);
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

	async onLink(provider: Provider) {
		await LinkedAccounts.link(
			this.$router,
			provider,
			'/web/dash/linked-accounts/link/',
			'Game',
			this.game.id
		);
	}

	async onUnlink(provider: Provider) {
		if (
			provider === LinkedAccount.PROVIDER_FACEBOOK &&
			this.facebookAccount &&
			this.facebookAccount.facebookSelectedPage
		) {
			const confirmRemoval = await ModalConfirm.show(
				this.$gettextInterpolate(
					'Do you really want to unlink your Facebook account? Your Facebook Page "%{ title }" will also be unlinked in the process.',
					{
						title: this.facebookAccount.facebookSelectedPage.name,
					}
				),
				undefined,
				'yes'
			);
			if (!confirmRemoval) {
				return;
			}
		} else if (
			provider === LinkedAccount.PROVIDER_TUMBLR &&
			this.tumblrAccount &&
			this.tumblrAccount.tumblrSelectedBlog
		) {
			const confirmRemoval = await ModalConfirm.show(
				this.$gettextInterpolate(
					'Do you really want to unlink your Tumblr account? Your Tumblr Blog "%{ title }" will also be unlinked in the process.',
					{
						title: this.tumblrAccount.tumblrSelectedBlog.title,
					}
				),
				undefined,
				'yes'
			);
			if (!confirmRemoval) {
				return;
			}
		}

		const response = await Api.sendRequest(
			'/web/dash/linked-accounts/unlink/' +
				provider +
				'?resource=Game&resourceId=' +
				this.game.id,
			{}
		);

		const providerName = getLinkedAccountProviderDisplayName(provider);
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
			this.$gettext('Select Facebook Page')
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
				'/web/dash/linked-accounts/link-facebook-page/' +
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
			'/web/dash/linked-accounts/unlink-facebook-page/' +
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

	async onSelectTumblrBlog() {
		if (!this.tumblrAccount) {
			return;
		}

		const modalResult = await ModalTumblrBlogSelector.show(
			this.$gettext('Select a blog you want to post to with this account'),
			this.tumblrAccount,
			this.$gettext('Select Tumblr Blog')
		);

		if (modalResult) {
			// do not send if the same blog was already selected
			if (
				this.tumblrAccount.tumblrSelectedBlog &&
				JSON.stringify(modalResult) ===
					JSON.stringify(this.tumblrAccount.tumblrSelectedBlog)
			) {
				return;
			}

			const payload = await Api.sendRequest(
				'/web/dash/linked-accounts/link-tumblr-blog/' +
					this.game.id +
					'/' +
					this.tumblrAccount.id +
					'/' +
					modalResult.name
			);

			if (payload.success) {
				if (payload.accounts) {
					// update accounts
					this.accounts = LinkedAccount.populate(payload.accounts);
				}

				Growls.success(
					this.$gettextInterpolate('Changed the selected Tumblr blog to %{ title }.', {
						title: modalResult.title,
					}),
					this.$gettext('Select Tumblr Blog')
				);
			} else {
				Growls.error(
					this.$gettext(
						'Failed to change to new Tumblr blog. Try to Sync your Tumblr account.'
					)
				);
			}
		}
	}

	async onUnlinkTumblrBlog() {
		if (!this.tumblrAccount || !this.tumblrAccount.tumblrSelectedBlog) {
			return;
		}

		const tempBlogTitle = this.tumblrAccount.tumblrSelectedBlog.title;

		const payload = await Api.sendRequest(
			'/web/dash/linked-accounts/unlink-tumblr-blog/' +
				this.game.id +
				'/' +
				this.tumblrAccount.id
		);

		if (payload.success) {
			if (payload.accounts) {
				// update accounts
				this.accounts = LinkedAccount.populate(payload.accounts);
			}

			Growls.success(
				this.$gettextInterpolate(
					`The Tumblr Blog %{ title } has been unlinked from %{ game }.`,
					{
						title: tempBlogTitle,
						game: this.game.title,
					}
				),
				this.$gettext('Tumblr Blog Unlinked')
			);
		} else {
			Growls.error(this.$gettext(`Could not unlink your Tumblr Blog.`));
		}
	}
}
