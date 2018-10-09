import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewMembers: RouteConfig = {
	name: 'communities.view.members',
	path: 'members',
	props: true,
	component: () => import(/* webpackChunkName: "routeCommunitiesViewMembers" */ './members'),
};
