import { RouteConfig } from 'vue-router';

import { routeForumsLandingOverview } from './overview/overview.route';
import { routeForumsLandingActive } from './active/active.route';

export const routeForumsLanding: RouteConfig = {
	path: '',
	props: true,
	component: () => import(/* webpackChunkName: "routeForumsLanding" */ './landing'),
	children: [routeForumsLandingOverview, routeForumsLandingActive],
};
