import { RouteRecordRaw } from 'vue-router';

export const routeCommunitiesViewChannel: RouteRecordRaw = {
	name: 'communities.view.channel',
	path: ':channel',
	component: () => import('./RouteCommunitiesViewChannel.vue'),
};
