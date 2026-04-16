import { RouteRecordRaw } from 'vue-router';

import { routeRealmsOverview } from '~app/views/realms/view/overview/overview.route';

export const routeRealmsView: RouteRecordRaw = {
	name: 'realms.view',
	path: '/realm/:path',
	component: () => import('~app/views/realms/view/RouteRealmsView.vue'),
	children: [routeRealmsOverview],
};
