import VueRouter from 'vue-router';

export const routeDashAccountLinkedAccountsList: VueRouter.RouteConfig = {
	name: 'dash.account.linked-accounts.list',
	path: 'linked-accounts',
	props: true,
	component: () => import('./list'),
};
