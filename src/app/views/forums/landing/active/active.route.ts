import VueRouter from 'vue-router';

export const routeForumsLandingActive: VueRouter.RouteConfig = {
	name: 'forums.landing.active',
	path: 'active',
	props: true,
	component: () => import(/* webpackChunkName: "routeForumsLandingActive" */ './active'),
};
