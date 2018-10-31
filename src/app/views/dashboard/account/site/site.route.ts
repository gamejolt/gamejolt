import { RouteConfig } from 'vue-router';

export const routeDashAccountSite: RouteConfig = {
	name: 'dash.account.site',
	path: 'site/:siteTab?',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashAccountSite" */ './site'),
};
