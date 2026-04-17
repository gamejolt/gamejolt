import { RouteRecordRaw } from 'vue-router';

export const routeDashAccountMobileNav: RouteRecordRaw = {
	name: 'dash.account-mobile-nav',
	path: 'account/nav',
	component: () => import('~app/views/dashboard/account/RouteDashAccountMobileNav.vue'),
};
