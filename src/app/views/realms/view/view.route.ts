import { RouteRecordRaw } from 'vue-router';
import { routeRealmsOverview } from './overview/overview.route';

export const routeRealmsView: RouteRecordRaw = {
	name: 'realms.view',
	path: '/realm/:path',
	component: () => import('./RouteRealmsView.vue'),
	children: [routeRealmsOverview],
};
