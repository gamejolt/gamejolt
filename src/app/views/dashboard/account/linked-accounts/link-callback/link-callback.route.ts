import { RouteRecordRaw } from 'vue-router';

export const routeDashAccountLinkedAccountsLinkCallback: RouteRecordRaw = {
	name: 'dash.account.linked-accounts.link-callback',
	path: 'linked-accounts/link-callback/:provider',
	component: () => import('./RouteDashAccountLinkedAccountsLinkCallback.vue'),
};
