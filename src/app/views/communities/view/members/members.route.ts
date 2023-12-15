import { RouteRecordRaw } from 'vue-router';

export const routeCommunitiesViewMembers: RouteRecordRaw = {
	name: 'communities.view.members',
	path: 'members',
	component: () => import('./RouteCommunitiesViewMembers.vue'),
};
