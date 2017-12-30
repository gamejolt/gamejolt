import { RouteConfig } from 'vue-router';

export const routeLandingClient: RouteConfig = {
	name: 'landing.client',
	path: '/client',
	props: true,
	component: () => import(/* webpackChunkName: "routeLandingClient" */ './client'),
};
