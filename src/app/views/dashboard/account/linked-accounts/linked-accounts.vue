<script lang="ts">
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { Api } from '../../../../../_common/api/api.service';
import { showErrorGrowl, showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import {
	LinkedAccountModel,
	Provider,
	getLinkedAccountProviderDisplayName,
} from '../../../../../_common/linked-account/linked-account.model';
import AppLinkedAccount from '../../../../../_common/linked-account/linked-account.vue';
import { LinkedAccounts } from '../../../../../_common/linked-account/linked-accounts.service';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../_common/route/legacy-route-component';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { $gettext, Translate } from '../../../../../_common/translate/translate.service';
import { UserSetPasswordModal } from '../../../../components/user/set-password-modal/set-password-modal.service';
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

	get user() {
		return this.commonStore.user;
	}

	accounts: LinkedAccountModel[] = [];
	loading = false;

	get facebookAccount() {
		return this.getAccount(LinkedAccountModel.PROVIDER_FACEBOOK);
	}

	get googleAccount() {
		return this.getAccount(LinkedAccountModel.PROVIDER_GOOGLE);
	}

	get twitchAccount() {
		return this.getAccount(LinkedAccountModel.PROVIDER_TWITCH);
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
		return this.routeStore.heading;
	}

	routeCreated() {
		this.routeStore.heading = $gettext(`Linked Accounts`);
	}

	routeResolved($payload: any) {
		this.accounts = LinkedAccountModel.populate($payload.accounts);
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
			this.accounts = LinkedAccountModel.populate(response.accounts);
			const providerName = getLinkedAccountProviderDisplayName(provider);
			showSuccessGrowl(
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

				showSuccessGrowl(
					this.$gettext('Your new password has been set. You can now log in with it.'),
					this.$gettext('Password Set')
				);

				// Try to unlink again once they've set one!
				await this.onUnlink(provider);
			} else {
				showErrorGrowl(this.$gettext('Failed to unlink account from the site.'));
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
					provider="facebook"
					@link="onLink"
					@sync="onLink"
					@unlink="onUnlink"
				/>
			</div>
			<div class="col-md-8 col-lg-6">
				<AppLinkedAccount
					:account="googleAccount"
					:disabled="loading"
					provider="google"
					@link="onLink"
					@sync="onLink"
					@unlink="onUnlink"
				/>
			</div>
			<div class="col-md-8 col-lg-6">
				<AppLinkedAccount
					:account="twitchAccount"
					:disabled="loading"
					provider="twitch"
					@link="onLink"
					@sync="onLink"
					@unlink="onUnlink"
				/>
			</div>
		</div>
	</div>
</template>
