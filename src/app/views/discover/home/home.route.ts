import { RouteRecordRaw } from 'vue-router';

export const routeDiscoverHome: RouteRecordRaw = {
	name: 'discover.home',
	path: '/discover',
	component: () => import('~app/views/discover/home/RouteDiscoverHome.vue'),
};
