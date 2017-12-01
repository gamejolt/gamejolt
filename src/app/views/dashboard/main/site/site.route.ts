import { RouteConfig } from 'vue-router';

export const routeDashMainSite: RouteConfig = {
	name: 'dash.main.site',
	path: 'site/:siteTab?',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashMainSite" */ './site'),
};
