import { RouteConfig } from 'vue-router';

export const routeLandingRedlight: RouteConfig = {
	name: 'landing.redlight',
	path: '/redlight',
	props: true,
	component: () => import(/* webpackChunkName: "routeRedlight" */ './redlight'),
};
