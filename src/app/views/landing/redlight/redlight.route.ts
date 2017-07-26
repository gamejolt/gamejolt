import VueRouter from 'vue-router';

export const routeLandingRedlight: VueRouter.RouteConfig = {
	name: 'landing.redlight',
	path: '/redlight',
	props: true,
	component: () => import(/* webpackChunkName: "routeRedlight" */ './redlight'),
};
