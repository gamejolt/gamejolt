import { RouteRecordRaw } from 'vue-router';

export const routeDashStickersEdit: RouteRecordRaw = {
	name: 'dash.stickers.edit',
	path: 'edit',
	component: () => import('./RouteDashStickersEdit.vue'),
};
