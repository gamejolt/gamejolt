<script lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Api } from '../../../../../_common/api/api.service';
import { showErrorGrowl, showSuccessGrowl } from '../../../../../_common/growls/growls.service';
import AppLinkedAccount from '../../../../../_common/linked-account/AppLinkedAccount.vue';
import {
	LinkedAccountModel,
	LinkedAccountProvider,
	getLinkedAccountProviderDisplayName,
} from '../../../../../_common/linked-account/linked-account.model';
import { LinkedAccounts } from '../../../../../_common/linked-account/linked-accounts.service';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../_common/route/route-component';
import { useCommonStore } from '../../../../../_common/store/common-store';
import { $gettext } from '../../../../../_common/translate/translate.service';
import { showUserSetPasswordModal } from '../../../../components/user/set-password-modal/set-password-modal.service';
import { useAccountRouteController } from '../RouteDashAccount.vue';
export default {
	...defineAppRouteOptions({
		deps: {},
		resolver: () => Api.sendRequest('/web/dash/linked-accounts?resource=User'),
	}),
};
</script>

<script lang="ts" setup>
const routeStore = useAccountRouteController()!;
const { user } = useCommonStore();
const router = useRouter();

const accounts = ref<LinkedAccountModel[]>([]);
const loading = ref(false);

const facebookAccount = computed(() => getAccount(LinkedAccountProvider.Facebook));
const googleAccount = computed(() => getAccount(LinkedAccountProvider.Google));
const twitchAccount = computed(() => getAccount(LinkedAccountProvider.Twitch));

function getAccount(provider: LinkedAccountProvider) {
	if (accounts.value) {
		for (const account of accounts.value) {
			if (account.provider === provider) {
				return account;
			}
		}
	}
	return null;
}

async function onLink(provider: LinkedAccountProvider) {
	loading.value = true;
	await LinkedAccounts.link(router, provider, '/web/dash/linked-accounts/link/', 'User');
}

async function onUnlink(provider: LinkedAccountProvider) {
	if (!user.value) {
		return;
	}

	loading.value = true;
	const response = await Api.sendRequest(
		'/web/dash/linked-accounts/unlink/' + provider + '?resource=User',
		{}
	);
	if (response.success) {
		accounts.value = LinkedAccountModel.populate(response.accounts);
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
				loading.value = false;
				return;
			}

			showSuccessGrowl(
				$gettext('Your new password has been set. You can now log in with it.'),
				$gettext('Password Set')
			);

			// Try to unlink again once they've set one!
			await onUnlink(provider);
		} else {
			showErrorGrowl($gettext('Failed to unlink account from the site.'));
		}
	}
	loading.value = false;
}

createAppRoute({
	routeTitle: computed(() => routeStore.heading.value),
	onInit() {
		routeStore.heading.value = $gettext(`Linked Accounts`);
	},
	onResolved({ payload }) {
		accounts.value = LinkedAccountModel.populate(payload.accounts);
	},
});
</script>

<template>
	<div>
		<div class="row linked-accounts-list">
			<div class="col-md-8 col-lg-6">
				<AppLinkedAccount
					:account="facebookAccount"
					:disabled="loading"
					:provider="LinkedAccountProvider.Facebook"
					@link="onLink"
					@sync="onLink"
					@unlink="onUnlink"
				/>
			</div>
			<div class="col-md-8 col-lg-6">
				<AppLinkedAccount
					:account="googleAccount"
					:disabled="loading"
					:provider="LinkedAccountProvider.Google"
					@link="onLink"
					@sync="onLink"
					@unlink="onUnlink"
				/>
			</div>
			<div class="col-md-8 col-lg-6">
				<AppLinkedAccount
					:account="twitchAccount"
					:disabled="loading"
					:provider="LinkedAccountProvider.Twitch"
					@link="onLink"
					@sync="onLink"
					@unlink="onUnlink"
				/>
			</div>
		</div>
	</div>
</template>
