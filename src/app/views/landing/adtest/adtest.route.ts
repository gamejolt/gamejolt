import { RouteConfig } from 'vue-router';

export const routeLandingAdtest: RouteConfig = {
	name: 'landing.adtest',
	path: '/test-video-ad',
	component: () => import(/* webpackChunkName: "routeLandingAdtest" */ './adtest.vue'),
};
