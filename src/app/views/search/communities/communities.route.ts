import { RouteConfig } from 'vue-router';

export const routeSearchCommunities: RouteConfig = {
	name: 'search.communities',
	path: 'communities',
	component: () => import(/* webpackChunkName: "routeSearch" */ './communities.vue'),
};
