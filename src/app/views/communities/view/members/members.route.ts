import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewMembers: RouteConfig = {
	name: 'communities.view.members',
	path: 'members',
	component: () => import(/* webpackChunkName: "routeCommunitiesViewMembers" */ './members.vue'),
};
