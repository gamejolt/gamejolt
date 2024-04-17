<script lang="ts">
import { RouteLocationNormalized, useRoute, useRouter } from 'vue-router';
import { Api } from '../../../../../../_common/api/api.service';
import { showErrorGrowl, showSuccessGrowl } from '../../../../../../_common/growls/growls.service';
import {
	LinkedAccountModel,
	LinkedAccountProvider,
	getLinkedAccountProviderDisplayName,
} from '../../../../../../_common/linked-account/linked-account.model';
import {
	createAppRoute,
	defineAppRouteOptions,
} from '../../../../../../_common/route/route-component';
import { useCommonStore } from '../../../../../../_common/store/common-store';
import { $gettext } from '../../../../../../_common/translate/translate.service';

export default {
	...defineAppRouteOptions({
		deps: null,
		resolver({ route }) {
			const url = constructUrl('/web/dash/linked-accounts/link-callback/', route);
			// Force POST.
			return Api.sendRequest(url, {});
		},
	}),
};

function constructUrl(baseUrl: string, route: RouteLocationNormalized) {
	let url = baseUrl + route.params.provider;
	let firstParam = true;

	for (const param of ['oauth_verifier', 'state', 'code']) {
		const value = route.query[param];
		if (value) {
			url += (firstParam ? '?' : '&') + param + '=' + value;
			firstParam = false;
		}
	}

	url += (firstParam ? '?' : '&') + 'resource=User';

	return url;
}
</script>

<script lang="ts" setup>
const route = useRoute();
const router = useRouter();
const { user } = useCommonStore();

createAppRoute({
	onResolved({ payload }) {
		if (!user.value) {
			return;
		}

		const provider = route.params.provider as LinkedAccountProvider;
		const providerName = getLinkedAccountProviderDisplayName(provider);
		if (!payload.success) {
			switch (payload.reason) {
				case 'account-taken':
					showErrorGrowl(
						$gettext(
							'This %{ provider } account is already linked to another Game Jolt account.',
							{
								provider: providerName,
							}
						)
					);
					break;

				case 'channel-taken':
					showErrorGrowl(
						$gettext(
							'This YouTube channel is already linked to another Game Jolt account.'
						)
					);
					break;

				case 'no-channel':
					showErrorGrowl(
						$gettext(
							'The selected Google account has no valid YouTube channel associated with it.'
						)
					);
					break;

				case 'not-public':
					showErrorGrowl($gettext('This YouTube channel is not public.'));
					break;

				case 'invalid-google-account':
					showErrorGrowl(
						$gettext('This Google account does not support Sign Up with Google.')
					);
					break;

				default:
					showErrorGrowl(
						$gettext('Unable to link your %{ provider } account.', {
							provder: providerName,
						})
					);
					break;
			}
		} else {
			switch (provider) {
				case LinkedAccountProvider.Facebook:
				case LinkedAccountProvider.Google:
				case LinkedAccountProvider.Twitch:
					{
						const account = new LinkedAccountModel(payload.account);
						showSuccessGrowl(
							$gettext('Your %{ provider } account (%{ name }) has been linked.', {
								name: account.name,
								provider: providerName,
							}),
							$gettext('Account Linked')
						);
					}
					break;
			}
		}

		router.push({
			name: 'dash.account.linked-accounts',
		});
	},
});
</script>

<template>
	<div />
</template>
