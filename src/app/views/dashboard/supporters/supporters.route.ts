import { RouteRecordRaw } from 'vue-router';

export const routeDashSupporters: RouteRecordRaw = {
	name: 'dash.supporters',
	path: 'supporters',
	component: () => import('~app/views/dashboard/supporters/RouteDashSupporters.vue'),
};
