import { RouteRecordRaw } from 'vue-router';

export const routeDashAccountSite: RouteRecordRaw = {
	name: 'dash.account.site',
	path: 'site/:siteTab?',
	component: () => import('./RouteDashAccountSite.vue'),
};
