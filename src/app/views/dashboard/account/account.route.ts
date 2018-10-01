import { RouteConfig } from 'vue-router';

import { routeDashAccountEdit } from './edit/edit.route';
import { routeDashAccountEmailPreferences } from './email-preferences/email-preferences.route';
import { routeDashAccountChangePassword } from './change-password/change-password.route';
import { routeDashAccountLinkedAccountsList } from './linked-accounts/list/list.route';
import { routeDashAccountLinkedAccountsLinking } from './linked-accounts/linking/linking.route';
import { routeDashAccountLinkedAccountsLinkCallback } from './linked-accounts/link-callback/link-callback.route';
import { routeDashAccountFinancials } from './financials/financials.route';
import { routeDashAccountPaymentMethods } from './payment-methods/payment-methods.route';
import { routeDashAccountAddresses } from './addresses/addresses.route';

export const routeDashAccount: RouteConfig = {
	path: '/dashboard',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashAccount" */ './account'),
	children: [
		routeDashAccountEdit,
		routeDashAccountEmailPreferences,
		routeDashAccountChangePassword,
		routeDashAccountLinkedAccountsList,
		routeDashAccountLinkedAccountsLinking,
		routeDashAccountLinkedAccountsLinkCallback,
		routeDashAccountFinancials,
		routeDashAccountPaymentMethods,
		routeDashAccountAddresses,
	],
};
