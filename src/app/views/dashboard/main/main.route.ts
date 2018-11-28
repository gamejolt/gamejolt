import { RouteConfig } from 'vue-router';
import { routeDashMainOverview } from './overview/overview.route';

export const routeDashMain: RouteConfig = {
	name: 'dash.main',
	path: '/dashboard',
	component: () => import(/* webpackChunkName: "routeDashMain" */ './main'),
	children: [routeDashMainOverview],
};
