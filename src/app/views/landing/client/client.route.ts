import { RouteRecordRaw } from 'vue-router';

export const routeLandingClient: RouteRecordRaw = {
	name: 'landing.client',
	path: '/client',
	component: () => import('./client.vue'),
};
