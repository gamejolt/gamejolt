import { RouteRecordRaw } from 'vue-router';

export const routeRealmsView: RouteRecordRaw = {
	name: 'realms.view',
	path: '/realm/:path',
	component: () => import('./RouteRealmsView.vue'),
};
