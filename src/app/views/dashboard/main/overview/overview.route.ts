import { RouteConfig } from 'vue-router';

export const routeDashMainOverview: RouteConfig = {
	name: 'dash.main.overview',
	path: '/dashboard',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashMainOverview" */ './overview'),
};
