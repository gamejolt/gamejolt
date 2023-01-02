import { RouteRecordRaw } from 'vue-router';

export const routeSearchRealms: RouteRecordRaw = {
	name: 'search.realms',
	path: 'realms',
	component: () => import('./RouteSearchRealms.vue'),
};
