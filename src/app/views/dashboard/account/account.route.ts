import { RouteConfig } from 'vue-router';
import { routeDashAccountAddresses } from './addresses/addresses.route';
import { routeDashAccountChangePassword } from './change-password/change-password.route';
import { routeDashAccountEdit } from './edit/edit.route';
import { routeDashAccountEmailPreferences } from './email-preferences/email-preferences.route';
import { routeDashAccountFinancials } from './financials/financials.route';
import { routeDashAccountLinkedAccountsLinkCallback } from './linked-accounts/link-callback/link-callback.route';
import { routeDashAccountLinkedAccounts } from './linked-accounts/linked-accounts.route';
import { routeDashAccountPaymentMethods } from './payment-methods/payment-methods.route';
import { routeDashAccountPurchasesList } from './purchases/list/list.route';
import { routeDashAccountPurchasesView } from './purchases/view/view.route';
import { routeDashAccountSite } from './site/site.route';
import { routeDashAccountWithdrawFunds } from './withdraw-funds/withdraw-funds.route';

export const routeDashAccount: RouteConfig = {
	path: '/dashboard',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashAccount" */ './account'),
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
		routeDashAccountWithdrawFunds,
	],
};
