import { RouteConfig } from 'vue-router';

export const routeDashAccountMobileNav: RouteConfig = {
	name: 'dash.account-mobile-nav',
	path: 'account/nav',
	component: () => import(/* webpackChunkName: "routeDashAccountMobileNav" */ './mobile-nav.vue'),
};
