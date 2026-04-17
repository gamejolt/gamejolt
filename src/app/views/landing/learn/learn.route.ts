import { RouteRecordRaw } from 'vue-router';

export const routeLandingLearn: RouteRecordRaw = {
	name: 'landing.learn',
	path: '/learn',
	component: () => import('~app/views/landing/learn/RouteLandingLearn.vue'),
};
