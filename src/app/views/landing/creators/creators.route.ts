import { RouteRecordRaw } from 'vue-router';

export const routeLandingCreators: RouteRecordRaw = {
	name: 'landing.creators',
	path: '/creators',
	alias: '/creator',
	component: () => import('~app/views/landing/creators/RouteLandingCreators.vue'),
};
