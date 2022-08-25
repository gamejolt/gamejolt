import { RouteRecordRaw } from 'vue-router';

export const routeLandingCreator: RouteRecordRaw = {
	name: 'landing.creator',
	path: '/creator',
	component: () => import('./RouteLandingCreator.vue'),
};
