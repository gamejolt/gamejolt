import { RouteConfig } from 'vue-router';

export const routeDiscoverCommunities: RouteConfig = {
	name: 'discover.communities',
	path: '/communities',
	component: () => import(/* webpackChunkName: "routeDiscoverCommunities" */ './communities.vue'),
};
