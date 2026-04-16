import { RouteRecordRaw } from 'vue-router';

export const routeLegalSafety: RouteRecordRaw = {
	name: 'legal.safety',
	path: '/safety',
	component: () => import('~app/views/legal/safety/RouteLegalSafety.vue'),
};
