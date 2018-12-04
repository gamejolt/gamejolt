import { RouteConfig } from 'vue-router';

export const routeDashAccountLinkedAccountsLinkCallback: RouteConfig = {
	name: 'dash.account.linked-accounts.link-callback',
	path: 'linked-accounts/link-callback/:provider',
	component: () =>
		import(/* webpackChunkName: "routeDashAccountLinkedAccountsLinkCallback" */ './link-callback'),
};
