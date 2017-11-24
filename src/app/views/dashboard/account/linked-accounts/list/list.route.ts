import { RouteConfig } from 'vue-router';

export const routeDashAccountLinkedAccountsList: RouteConfig = {
	name: 'dash.account.linked-accounts.list',
	path: 'linked-accounts',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashAccountLinkedAccountsList" */ './list'),
};
