import { RouteRecordRaw } from 'vue-router';

export const routeCommunitiesViewEditModerators: RouteRecordRaw = {
	name: 'communities.view.edit.moderators',
	path: 'moderators',
	component: () => import('./RouteCommunitiesViewEditModerators.vue'),
};
