import { RouteConfig } from 'vue-router';

export const routeLandingLearn: RouteConfig = {
	name: 'landing.learn',
	path: '/learn',
	props: true,
	component: () => import(/* webpackChunkName: "routeLandingLearn" */ './learn'),
};
