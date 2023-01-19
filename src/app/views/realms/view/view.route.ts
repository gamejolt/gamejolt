import { RouteRecordRaw } from 'vue-router';
import { routeRealmsViewFiresides } from './firesides/firesides.route';
import { routeRealmsOverview } from './overview/overview.route';

export const routeRealmsView: RouteRecordRaw = {
	name: 'realms.view',
	path: '/realm/:path',
	component: () => import('./RouteRealmsView.vue'),
	children: [routeRealmsViewFiresides, routeRealmsOverview],
};
