import { RouteConfig } from 'vue-router';

export const routeDashAccountLinkedAccountsLinking: RouteConfig = {
	name: 'dash.account.linked-accounts.linking',
	path: 'linked-accounts/linking',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeDashAccountLinkedAccountsLinking" */ './linking'),
};
