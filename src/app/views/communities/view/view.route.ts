import { RouteConfig } from 'vue-router';
import { routeCommunitiesViewMembers } from './members/members.route';
import { routeCommunitiesViewOverview } from './overview/overview.route';

export const routeCommunitiesView: RouteConfig = {
	name: 'communities.view',
	path: '/c/:path',
	component: () => import(/* webpackChunkName: "routeCommunitiesView" */ './view.vue'),
	// The order matters here.
	children: [routeCommunitiesViewMembers, routeCommunitiesViewOverview],
};
