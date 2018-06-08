import { RouteConfig } from 'vue-router';

import { routeDashAccountEdit } from './edit/edit.route';
import { routeDashAccountEmailPreferences } from './email-preferences/email-preferences.route';
import { routeDashAccountChangePassword } from './change-password/change-password.route';
import { routeDashAccountLinkedAccountsLinking } from './linked-accounts/linking/linking.route';
import { routeDashAccountLinkedAccountsLinkCallback } from './linked-accounts/link-callback/link-callback.route';
import { routeDashAccountFinancials } from './financials/financials.route';
import { routeDashAccountLinkedAccounts } from './linked-accounts/linked-accounts.route';

export const routeDashAccount: RouteConfig = {
	path: '/dashboard',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashAccount" */ './account'),
	children: [
		routeDashAccountEdit,
		routeDashAccountEmailPreferences,
		routeDashAccountChangePassword,
		routeDashAccountLinkedAccounts,
		routeDashAccountLinkedAccountsLinking,
		routeDashAccountLinkedAccountsLinkCallback,
		routeDashAccountFinancials,
	],
};
