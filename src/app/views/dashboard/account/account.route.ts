import { RouteConfig } from 'vue-router';

import { routeDashAccountEdit } from './edit/edit.route';
import { routeDashAccountAvatar } from './avatar/avatar.route';
import { routeDashAccountEmailPreferences } from './email-preferences/email-preferences.route';
import { routeDashAccountChangePassword } from './change-password/change-password.route';
import { routeDashAccountLinkedAccountsList } from './linked-accounts/list/list.route';
import { routeDashAccountLinkedAccountsLinking } from './linked-accounts/linking/linking.route';
import { routeDashAccountLinkedAccountsLinkCallback } from './linked-accounts/link-callback/link-callback.route';
import { routeDashAccountFinancials } from './financials/financials.route';

export const routeDashAccount: RouteConfig = {
	path: '/dashboard',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashAccount" */ './account'),
	children: [
		routeDashAccountEdit,
		routeDashAccountAvatar,
		routeDashAccountEmailPreferences,
		routeDashAccountChangePassword,
		routeDashAccountLinkedAccountsList,
		routeDashAccountLinkedAccountsLinking,
		routeDashAccountLinkedAccountsLinkCallback,
		routeDashAccountFinancials,
	],
};
