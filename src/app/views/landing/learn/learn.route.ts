import { RouteConfig } from 'vue-router';

export const routeLandingLearn: RouteConfig = {
	name: 'landing.learn',
	path: '/learn',
	component: () => import(/* webpackChunkName: "routeLandingLearn" */ './learn.vue'),
};
