import VueRouter from 'vue-router';

export const routeDashAccountLinkedAccountsLinking: VueRouter.RouteConfig = {
	name: 'dash.account.linked-accounts.linking',
	path: 'linked-accounts/linking',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeDashAccountLinkedAccountsLinking" */ './linking'),
};
