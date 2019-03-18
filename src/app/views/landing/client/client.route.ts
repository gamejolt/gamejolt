import { RouteConfig } from 'vue-router';

export const routeLandingClient: RouteConfig = {
	name: 'landing.client',
	path: '/client',
	component: () => import(/* webpackChunkName: "routeLandingClient" */ './client.vue'),
};
