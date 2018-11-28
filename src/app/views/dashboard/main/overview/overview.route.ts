import { RouteConfig } from 'vue-router';

export const routeDashMainOverview: RouteConfig = {
	name: 'dash.main.overview',
	path: '/dashboard',
	component: () => import(/* webpackChunkName: "routeDashMainOverview" */ './overview'),
};
