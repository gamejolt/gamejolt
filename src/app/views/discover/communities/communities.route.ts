import { RouteRecordRaw } from 'vue-router';

export const routeDiscoverCommunities: RouteRecordRaw = {
	name: 'discover.communities',
	path: '/communities',
	component: () => import('~app/views/discover/communities/RouteDiscoverCommunities.vue'),
};
