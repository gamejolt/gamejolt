import { RouteRecordRaw } from 'vue-router';

export const routeDiscoverHome: RouteRecordRaw = {
	name: 'discover.home',
	path: '/discover',
	component: () => import('./RouteDiscoverHome.vue'),
};
