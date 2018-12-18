import View from '!view!./linked-accounts.html';
import { Component } from 'vue-property-decorator';
import { Api } from '../../../../../lib/gj-lib-client/components/api/api.service';
import { Growls } from '../../../../../lib/gj-lib-client/components/growls/growls.service';
import { AppLinkedAccount } from '../../../../../lib/gj-lib-client/components/linked-account/linked-account';
import {
	getLinkedAccountProviderDisplayName,
	LinkedAccount,
	Provider,
	TumblrBlog,
} from '../../../../../lib/gj-lib-client/components/linked-account/linked-account.model';
import { LinkedAccounts } from '../../../../../lib/gj-lib-client/components/linked-account/linked-accounts.service';
import { ModalConfirm } from '../../../../../lib/gj-lib-client/components/modal/confirm/confirm-service';
import {
	BaseRouteComponent,
	RouteResolver,
} from '../../../../../lib/gj-lib-client/components/route/route-component';
import { Translate } from '../../../../../lib/gj-lib-client/components/translate/translate.service';
import { YoutubeChannel } from '../../../../../lib/gj-lib-client/components/youtube/channel/channel-model';
import { AppState, AppStore } from '../../../../../lib/gj-lib-client/vue/services/app/app-store';
import { UserSetPasswordModal } from '../../../../components/user/set-password-modal/set-password-modal.service';
import { RouteStore, routeStore, RouteStoreModule } from '../account.store';

@View
@Component({
	name: 'RouteDashAccountLinkedAccounts',
	components: {
		AppLinkedAccount,
	},
})
@RouteResolver({
	deps: {},
	resolver: () => Api.sendRequest('/web/dash/linked-accounts?resource=User'),
	resolveStore({}) {
		routeStore.commit('setHeading', Translate.$gettext(`Linked Accounts`));
	},
})
export default class RouteDashAccountLinkedAccounts extends BaseRouteComponent {
	@AppState
	user!: AppStore['user'];

	@RouteStoreModule.State
	heading!: RouteStore['heading'];

	accounts: LinkedAccount[] = [];
	channels: YoutubeChannel[] = [];
	loading = false;

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

	get tumblrAccount() {
		return this.getAccount(LinkedAccount.PROVIDER_TUMBLR);
	}

	get mixerAccount() {
		return this.getAccount(LinkedAccount.PROVIDER_MIXER);
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

	get routeTitle() {
		return this.heading;
	}

	routeResolved($payload: any) {
		this.channels = YoutubeChannel.populate($payload.channels);
		this.accounts = LinkedAccount.populate($payload.accounts);
	}

	async onLink(provider: Provider) {
		this.loading = true;
		await LinkedAccounts.link(
			this.$router,
			provider,
			'/web/dash/linked-accounts/link/',
			'User'
		);
	}

	async onUnlink(provider: Provider) {
		if (!this.user) {
			return;
		}

		this.loading = true;
		const response = await Api.sendRequest(
			'/web/dash/linked-accounts/unlink/' + provider + '?resource=User',
			{}
		);
		if (response.success) {
			this.accounts = LinkedAccount.populate(response.accounts);
			const providerName = getLinkedAccountProviderDisplayName(provider);
			Growls.success(
				Translate.$gettextInterpolate(
					`Your %{ provider } account has been unlinked from the site.`,
					{ provider: providerName }
				),
				Translate.$gettext('Account Unlinked')
			);
		} else {
			// If they don't have a password, we have to show them a modal to set it.
			if (response.reason === 'no-password') {
				const result = await UserSetPasswordModal.show();
				if (!result) {
					this.loading = false;
					return;
				}

				Growls.success(
					this.$gettext('Your new password has been set. You can now log in with it.'),
					this.$gettext('Password Set')
				);

				// Try to unlink again once they've set one!
				await this.onUnlink(provider);
			} else {
				Growls.error(this.$gettext('Failed to unlink account from the site.'));
			}
		}
		this.loading = false;
	}

	async linkYouTubeChannel() {
		if (!this.user) {
			return;
		}

		await LinkedAccounts.link(
			this.$router,
			'',
			'/web/dash/linked-accounts/link-youtube-channel',
			'User'
		);
	}

	async unlinkYouTubeChannel(channel: YoutubeChannel) {
		if (!this.user) {
			return;
		}

		const result = await ModalConfirm.show(
			this.$gettext(
				'Are you you want to unlink this channel? Any videos you may have done as part of this channel will be removed from Game Jolt.'
			)
		);

		if (!result) {
			return;
		}

		const payload = await channel.$remove();
		if (payload.success) {
			this.channels = YoutubeChannel.populate(payload.channels);
		} else {
			Growls.error(
				this.$gettextInterpolate(
					'Failed to remove YouTube channel %{ title } form Game Jolt.',
					{ title: channel.title }
				)
			);
		}
	}

	async onLinkTumblrBlog(tumblrBlog: TumblrBlog) {
		if (!this.tumblrAccount) {
			return;
		}

		this.loading = true;

		const payload = await Api.sendRequest(
			'/web/dash/linked-accounts/link-tumblr-blog/' +
				this.tumblrAccount.id +
				'/' +
				tumblrBlog.name +
				'?resource=User'
		);

		if (payload.success) {
			if (payload.accounts) {
				// update accounts
				this.accounts = LinkedAccount.populate(payload.accounts);
			}

			Growls.success(
				this.$gettextInterpolate('Changed the selected Tumblr blog to %{ title }.', {
					title: tumblrBlog.title,
				}),
				this.$gettext('Tumblr Blog Changed')
			);
		} else {
			Growls.error(
				this.$gettext(
					'Failed to change to new Tumblr blog. Maybe try to sync your Tumblr account.'
				)
			);
		}

		this.loading = false;
	}

	async onUnlinkTumblrBlog() {
		if (!this.tumblrAccount || !this.tumblrAccount.tumblrSelectedBlog) {
			return;
		}

		this.loading = true;

		const tempBlogTitle = this.tumblrAccount.tumblrSelectedBlog.title;

		const payload = await Api.sendRequest(
			'/web/dash/linked-accounts/unlink-tumblr-blog/' +
				this.tumblrAccount.id +
				'?resource=User'
		);

		if (payload.success) {
			if (payload.accounts) {
				// update accounts
				this.accounts = LinkedAccount.populate(payload.accounts);
			}

			Growls.success(
				this.$gettextInterpolate(`The Tumblr Blog %{ title } has been unlinked.`, {
					title: tempBlogTitle,
				}),
				this.$gettext('Tumblr Blog Unlinked')
			);
		} else {
			Growls.error(this.$gettext(`Could not unlink your Tumblr Blog.`));
		}

		this.loading = false;
	}
}
