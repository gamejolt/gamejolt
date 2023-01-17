import { RouteRecordRaw } from 'vue-router';

export const routeRealmsViewFiresides: RouteRecordRaw = {
	name: 'realms.view.firesides',
	path: 'firesides',
	component: () => import('./RouteRealmViewFiresides.vue'),
};
