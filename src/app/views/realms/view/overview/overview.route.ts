import { RouteRecordRaw } from 'vue-router';

export const routeRealmsOverview: RouteRecordRaw = {
	name: 'realms.view.overview',
	path: '',
	component: () => import('./RouteRealmsOverview.vue'),
};
