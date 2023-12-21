import { RouteRecordRaw } from 'vue-router';

export const routeLegalDeletion: RouteRecordRaw = {
	name: 'legal.deletion',
	path: '/account-deletion',
	component: () => import('./RouteLegalDeletion.vue'),
};
