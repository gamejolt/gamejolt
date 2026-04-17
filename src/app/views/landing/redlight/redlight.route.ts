import { RouteRecordRaw } from 'vue-router';

export const routeLandingRedlight: RouteRecordRaw = {
	name: 'landing.redlight',
	path: '/redlight',
	component: () => import('~app/views/landing/redlight/RouteLandingRedlight.vue'),
};
