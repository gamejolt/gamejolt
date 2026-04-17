import { RouteRecordRaw } from 'vue-router';

export const routeLegalTerms: RouteRecordRaw = {
	name: 'legal.terms',
	path: '/terms',
	component: () => import('~app/views/legal/terms/RouteLegalTerms.vue'),
};
