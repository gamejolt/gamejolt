import VueRouter from 'vue-router';

export const routeDashMainOverview: VueRouter.RouteConfig = {
	name: 'dash.main.overview',
	path: '/dashboard',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashMainOverview" */ './overview'),
};
