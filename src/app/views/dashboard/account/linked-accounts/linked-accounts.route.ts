import { RouteConfig } from 'vue-router';

export const routeDashAccountLinkedAccounts: RouteConfig = {
	name: 'dash.account.linked-accounts',
	path: 'linked-accounts',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeDashAccountLinkedAccounts" */ './linked-accounts'),
};
