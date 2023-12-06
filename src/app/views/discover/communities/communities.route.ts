import { RouteRecordRaw } from 'vue-router';

export const routeDiscoverCommunities: RouteRecordRaw = {
	name: 'discover.communities',
	path: '/communities',
	component: () => import('./RouteDiscoverCommunities.vue'),
};
