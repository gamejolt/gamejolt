import { RouteRecordRaw } from 'vue-router';

export const routeDashStickersView: RouteRecordRaw = {
	name: 'dash.stickers',
	path: '',
	component: () => import('./RouteDashStickersView.vue'),
};
