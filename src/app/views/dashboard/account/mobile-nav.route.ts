import { RouteConfig } from 'vue-router';

export const routeDashAccountMobileNav: RouteConfig = {
	name: 'dash.account-mobile-nav',
	path: 'account/nav',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashAccountMobileNav" */ './mobile-nav'),
};
