import { RouteRecordRaw } from 'vue-router';

export const routeDashLinking: RouteRecordRaw = {
	name: 'dash.linking',
	path: 'linking',
	component: () => import('./linking.vue'),
};
