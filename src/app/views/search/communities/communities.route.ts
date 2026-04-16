import { RouteRecordRaw } from 'vue-router';

export const routeSearchCommunities: RouteRecordRaw = {
	name: 'search.communities',
	path: 'communities',
	component: () => import('~app/views/search/communities/RouteSearchCommunities.vue'),
};
