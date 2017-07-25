import VueRouter from 'vue-router';

export const routeDashAccountLinkedAccountsLinkCallback: VueRouter.RouteConfig = {
	name: 'dash.account.linked-accounts.link-callback',
	path: 'linked-accounts/link-callback/:provider',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeDashAccountLinkedAccountsLinkCallback" */ './link-callback'),
};
