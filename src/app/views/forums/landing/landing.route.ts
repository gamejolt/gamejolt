import { RouteConfig } from 'vue-router';
import { routeForumsLandingActive } from './active/active.route';
import { routeForumsLandingOverview } from './overview/overview.route';

export const routeForumsLanding: RouteConfig = {
	path: '',
	component: () => import(/* webpackChunkName: "routeForumsLanding" */ './landing'),
	children: [routeForumsLandingOverview, routeForumsLandingActive],
};
