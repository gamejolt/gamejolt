import { RouteRecordRaw } from 'vue-router';

export const routeDashCreator: RouteRecordRaw = {
	name: 'dash.creator',
	path: 'creator',
	component: () => import('~app/views/dashboard/creator/RouteDashCreator.vue'),
};
