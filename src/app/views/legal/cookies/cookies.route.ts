import { RouteRecordRaw } from 'vue-router';

export const routeLegalCookies: RouteRecordRaw = {
	name: 'legal.cookies',
	path: '/cookies',
	component: () => import('./RouteLegalCookies.vue'),
};
