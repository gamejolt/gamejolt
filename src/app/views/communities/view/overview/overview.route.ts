import { RouteRecordRaw } from 'vue-router';

export const routeCommunitiesViewOverview: RouteRecordRaw = {
	name: 'communities.view.overview',
	path: '',
	component: () => import('./RouteCommunitiesViewOverview.vue'),
};
