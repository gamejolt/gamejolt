import { RouteRecordRaw } from 'vue-router';

import { routeDashAccountAddresses } from '~app/views/dashboard/account/addresses/addresses.route';
import { routeDashAccountBlocks } from '~app/views/dashboard/account/blocks/blocks.route';
import { routeDashAccountChangePassword } from '~app/views/dashboard/account/change-password/change-password.route';
import { routeDashAccountDeviceSettings } from '~app/views/dashboard/account/device-settings/device-settings.route';
import { routeDashAccountEdit } from '~app/views/dashboard/account/edit/edit.route';
import { routeDashAccountEmailPreferences } from '~app/views/dashboard/account/email-preferences/email-preferences.route';
import { routeDashAccountFinancials } from '~app/views/dashboard/account/financials/financials.route';
import { routeDashAccountLinkedAccountsLinkCallback } from '~app/views/dashboard/account/linked-accounts/link-callback/link-callback.route';
import { routeDashAccountLinkedAccounts } from '~app/views/dashboard/account/linked-accounts/linked-accounts.route';
import { routeDashAccountPaymentMethods } from '~app/views/dashboard/account/payment-methods/payment-methods.route';
import { routeDashAccountPurchasesList } from '~app/views/dashboard/account/purchases/list/list.route';
import { routeDashAccountPurchasesView } from '~app/views/dashboard/account/purchases/view/view.route';
import { routeDashAccountReferrals } from '~app/views/dashboard/account/referrals/referrals.route';
import { routeDashAccountSite } from '~app/views/dashboard/account/site/site.route';
import { routeDashAccountWallet } from '~app/views/dashboard/account/wallet/wallet.route';

export const routeDashAccount: RouteRecordRaw = {
	path: '',
	component: () => import('~app/views/dashboard/account/RouteDashAccount.vue'),
	children: [
		routeDashAccountEdit,
		routeDashAccountEmailPreferences,
		routeDashAccountChangePassword,
		routeDashAccountLinkedAccounts,
		routeDashAccountLinkedAccountsLinkCallback,
		routeDashAccountFinancials,
		routeDashAccountPaymentMethods,
		routeDashAccountAddresses,
		routeDashAccountPurchasesList,
		routeDashAccountPurchasesView,
		routeDashAccountSite,
		routeDashAccountWallet,
		routeDashAccountBlocks,
		routeDashAccountDeviceSettings,
		routeDashAccountReferrals,
	],
};
