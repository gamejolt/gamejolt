import { RouteRecordRaw } from 'vue-router';

export const routeDashAccountEdit: RouteRecordRaw = {
	name: 'dash.account.edit',
	path: 'profile/edit',
	component: () => import('./RouteDashAccountEdit.vue'),
};
