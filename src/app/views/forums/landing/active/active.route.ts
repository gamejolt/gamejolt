import { RouteConfig } from 'vue-router';

export const routeForumsLandingActive: RouteConfig = {
	name: 'forums.landing.active',
	path: 'active',
	component: () => import(/* webpackChunkName: "routeForumsLanding" */ './active'),
};
