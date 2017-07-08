import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';
import { routeDashAccountEdit } from './edit/edit.route';
import { routeDashAccountAvatar } from './avatar/avatar.route';
import { routeDashAccountEmailPreferences } from './email-preferences/email-preferences.route';
import { routeDashAccountChangePassword } from './change-password/change-password.route';
import { routeDashAccountLinkedAccountsList } from './linked-accounts/list/list.route';
import { routeDashAccountLinkedAccountsLinking } from './linked-accounts/linking/linking.route';
import { routeDashAccountLinkedAccountsLinkCallback } from './linked-accounts/link-callback/link-callback.route';

export const routeDashAccount: VueRouter.RouteConfig = {
	path: '/dashboard',
	props: true,
	component: () => asyncComponentLoader(import('./account')),
	children: [
		routeDashAccountEdit,
		routeDashAccountAvatar,
		routeDashAccountEmailPreferences,
		routeDashAccountChangePassword,
		routeDashAccountLinkedAccountsList,
		routeDashAccountLinkedAccountsLinking,
		routeDashAccountLinkedAccountsLinkCallback,
	],
};
