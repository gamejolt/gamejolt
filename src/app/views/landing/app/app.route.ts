import { RouteRecordRaw } from 'vue-router';

export const routeLandingApp: RouteRecordRaw = {
	name: 'landing.app',
	path: '/app',
	component: () => import('~app/views/landing/app/RouteLandingApp.vue'),
};
