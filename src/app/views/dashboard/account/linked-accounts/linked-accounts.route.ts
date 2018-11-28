import { RouteConfig } from 'vue-router';

export const routeDashAccountLinkedAccounts: RouteConfig = {
	name: 'dash.account.linked-accounts',
	path: 'linked-accounts',
	component: () =>
		import(/* webpackChunkName: "routeDashAccountLinkedAccounts" */ './linked-accounts'),
};
