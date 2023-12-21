import { RouteRecordRaw } from 'vue-router';

export const routeLandingLearn: RouteRecordRaw = {
	name: 'landing.learn',
	path: '/learn',
	component: () => import('./RouteLandingLearn.vue'),
};
