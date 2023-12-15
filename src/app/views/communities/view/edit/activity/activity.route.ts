import { RouteRecordRaw } from 'vue-router';

export const routeCommunitiesViewEditActivity: RouteRecordRaw = {
	name: 'communities.view.edit.activity',
	path: 'log',
	component: () => import('./RouteCommunitiesViewEditActivity.vue'),
};
