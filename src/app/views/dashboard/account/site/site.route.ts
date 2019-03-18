import { RouteConfig } from 'vue-router';

export const routeDashAccountSite: RouteConfig = {
	name: 'dash.account.site',
	path: 'site/:siteTab?',
	component: () => import(/* webpackChunkName: "routeDashAccountSite" */ './site.vue'),
};
