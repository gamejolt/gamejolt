import { RouteConfig } from 'vue-router';

export const routeLandingApp: RouteConfig = {
	name: 'landing.app',
	path: '/app',
	component: () => import(/* webpackChunkName: "routeLandingApp" */ './app.vue'),
};
