import { RouteConfig } from 'vue-router';

export const routeLandingAdtest: RouteConfig = {
	name: 'landing.adtest',
	path: '/adtest',
	component: () => import(/* webpackChunkName: "routeLandingAdtest" */ './adtest.vue'),
};
