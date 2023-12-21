import { RouteRecordRaw } from 'vue-router';

export const routeLegalPrivacy: RouteRecordRaw = {
	name: 'legal.privacy',
	path: '/privacy',
	component: () => import('./RouteLegalPrivacy.vue'),
};
