import { h } from 'vue';
import { setup } from 'vue-class-component';
import { Options } from 'vue-property-decorator';
import { RouteLocationNormalized } from 'vue-router';
import { Api } from '../../../../../../_common/api/api.service';
import { showErrorGrowl, showSuccessGrowl } from '../../../../../../_common/growls/growls.service';
import {
	LinkedAccountModel,
	LinkedAccountProvider,
	getLinkedAccountProviderDisplayName,
} from '../../../../../../_common/linked-account/linked-account.model';
import {
	LegacyRouteComponent,
	OptionsForLegacyRoute,
} from '../../../../../../_common/route/legacy-route-component';
import { useCommonStore } from '../../../../../../_common/store/common-store';

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

@Options({
	name: 'RouteDashAccountLinkedAccountsLinkCallback',
})
@OptionsForLegacyRoute({
	resolver({ route }) {
		const url = constructUrl('/web/dash/linked-accounts/link-callback/', route);
		// Force POST.
		return Api.sendRequest(url, {});
	},
})
export default class RouteDashAccountLinkedAccountsLinkCallback extends LegacyRouteComponent {
	commonStore = setup(() => useCommonStore());

	get user() {
		return this.commonStore.user;
	}

	routeResolved($payload: any) {
		if (!this.user) {
			return;
		}

		const provider = this.$route.params.provider as LinkedAccountProvider;
		const providerName = getLinkedAccountProviderDisplayName(provider);
		if (!$payload.success) {
			switch ($payload.reason) {
				case 'account-taken':
					showErrorGrowl(
						this.$gettext(
							'This %{ provider } account is already linked to another Game Jolt account.',
							{
								provider: providerName,
							}
						)
					);
					break;

				case 'channel-taken':
					showErrorGrowl(
						this.$gettext(
							'This YouTube channel is already linked to another Game Jolt account.'
						)
					);
					break;

				case 'no-channel':
					showErrorGrowl(
						this.$gettext(
							'The selected Google account has no valid YouTube channel associated with it.'
						)
					);
					break;

				case 'not-public':
					showErrorGrowl(this.$gettext('This YouTube channel is not public.'));
					break;

				case 'invalid-google-account':
					showErrorGrowl(
						this.$gettext('This Google account does not support Sign Up with Google.')
					);
					break;

				default:
					showErrorGrowl(
						this.$gettext('Unable to link your %{ provider } account.', {
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
						const account = new LinkedAccountModel($payload.account);
						showSuccessGrowl(
							this.$gettext(
								'Your %{ provider } account (%{ name }) has been linked.',
								{
									name: account.name,
									provider: providerName,
								}
							),
							this.$gettext('Account Linked')
						);
					}
					break;
			}
		}

		this.$router.push({
			name: 'dash.account.linked-accounts',
		});
	}

	render() {
		return h('div');
	}
}
