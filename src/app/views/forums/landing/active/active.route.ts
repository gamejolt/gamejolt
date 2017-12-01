import { RouteConfig } from 'vue-router';

export const routeForumsLandingActive: RouteConfig = {
	name: 'forums.landing.active',
	path: 'active',
	props: true,
	component: () => import(/* webpackChunkName: "routeForumsLanding" */ './active'),
};
