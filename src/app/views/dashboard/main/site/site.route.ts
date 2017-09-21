import VueRouter from 'vue-router';

export const routeDashMainSite: VueRouter.RouteConfig = {
	name: 'dash.main.site',
	path: 'site/:siteTab?',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashMainSite" */ './site'),
};
