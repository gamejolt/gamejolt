import { RouteRecordRaw } from 'vue-router';

export const routeDashAccountLinkedAccountsLinkCallback: RouteRecordRaw = {
	name: 'dash.account.linked-accounts.link-callback',
	path: 'linked-accounts/link-callback/:provider',
	component: () =>
		import(
			'~app/views/dashboard/account/linked-accounts/link-callback/RouteDashAccountLinkedAccountsLinkCallback.vue'
		),
};
