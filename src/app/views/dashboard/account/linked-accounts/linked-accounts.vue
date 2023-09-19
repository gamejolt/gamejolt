<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { showErrorGrowl, showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import {
	LinkedAccountModel,
	LinkedAccountProvider,
	getLinkedAccountProviderDisplayName,
} from '../../../../../_common/linked-account/linked-account.model';
import AppLinkedAccount from '../../../../../_common/linked-account/linked-account.vue';
import { LinkedAccounts } from '../../../../../_common/linked-account/linked-accounts.service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../_common/route/legacy-route-component';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { showUserSetPasswordModal } from '../../../../components/user/set-password-modal/set-password-modal.service';
import { useAccountRouteController } from '../RouteDashAccount.vue';

@Options({
	name: 'RouteDashAccountLinkedAccounts',
	components: {
		AppLinkedAccount,
	},
})
@OptionsForLegacyRoute({
	deps: {},
	resolver: () => Api.sendRequest('/web/dash/linked-accounts?resource=User'),
})
export default class RouteDashAccountLinkedAccounts extends LegacyRouteComponent {
	routeStore = setup(() => useAccountRouteController()!);
	commonStore = setup(() => useCommonStore());

	readonly accountProviderFacebook = LinkedAccountProvider.Facebook;
	readonly accountProviderGoogle = LinkedAccountProvider.Google;
	readonly accountProviderTwitch = LinkedAccountProvider.Twitch;

	get user() {
		return this.commonStore.user;
	}

	accounts: LinkedAccountModel[] = [];
	loading = false;

	get facebookAccount() {
		return this.getAccount(LinkedAccountProvider.Facebook);
	}

	get googleAccount() {
		return this.getAccount(LinkedAccountProvider.Google);
	}

	get twitchAccount() {
		return this.getAccount(LinkedAccountProvider.Twitch);
	}

	getAccount(provider: LinkedAccountProvider) {
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
		return this.routeStore.heading;
	}

	routeCreated() {
		this.routeStore.heading = $gettext(`Linked Accounts`);
	}

	routeResolved($payload: any) {
		this.accounts = LinkedAccountModel.populate($payload.accounts);
	}

	async onLink(provider: LinkedAccountProvider) {
		this.loading = true;
		await LinkedAccounts.link(
			this.$router,
			provider,
			'/web/dash/linked-accounts/link/',
			'User'
		);
	}

	async onUnlink(provider: LinkedAccountProvider) {
		if (!this.user) {
			return;
		}

		this.loading = true;
		const response = await Api.sendRequest(
			'/web/dash/linked-accounts/unlink/' + provider + '?resource=User',
			{}
		);
		if (response.success) {
			this.accounts = LinkedAccountModel.populate(response.accounts);
			const providerName = getLinkedAccountProviderDisplayName(provider);
			showSuccessGrowl(
				$gettext(`Your %{ provider } account has been unlinked from the site.`, {
					provider: providerName,
				}),
				$gettext('Account Unlinked')
			);
		} else {
			// If they don't have a password, we have to show them a modal to set it.
			if (response.reason === 'no-password') {
				const result = await showUserSetPasswordModal();
				if (!result) {
					this.loading = false;
					return;
				}

				showSuccessGrowl(
					$gettext('Your new password has been set. You can now log in with it.'),
					$gettext('Password Set')
				);

				// Try to unlink again once they've set one!
				await this.onUnlink(provider);
			} else {
				showErrorGrowl($gettext('Failed to unlink account from the site.'));
			}
		}
		this.loading = false;
	}
}
</script>

<template>
	<div>
		<div class="row linked-accounts-list">
			<div class="col-md-8 col-lg-6">
				<AppLinkedAccount
					:account="facebookAccount"
					:disabled="loading"
					:provider="accountProviderFacebook"
					@link="onLink"
					@sync="onLink"
					@unlink="onUnlink"
				/>
			</div>
			<div class="col-md-8 col-lg-6">
				<AppLinkedAccount
					:account="googleAccount"
					:disabled="loading"
					:provider="accountProviderGoogle"
					@link="onLink"
					@sync="onLink"
					@unlink="onUnlink"
				/>
			</div>
			<div class="col-md-8 col-lg-6">
				<AppLinkedAccount
					:account="twitchAccount"
					:disabled="loading"
					:provider="accountProviderTwitch"
					@link="onLink"
					@sync="onLink"
					@unlink="onUnlink"
				/>
			</div>
		</div>
	</div>
</template>
