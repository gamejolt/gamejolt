import { RouteConfig } from 'vue-router';
import { routeCommunitiesViewEdit } from './edit/edit.route';
import { routeCommunitiesViewMembers } from './members/members.route';
import { routeCommunitiesViewOverview } from './overview/overview.route';

export const routeCommunitiesView: RouteConfig = {
	name: 'communities.view',
	path: '/c/:path',
	component: () => import(/* webpackChunkName: "routeCommunitiesView" */ './view.vue'),
	// The order matters here.
	children: [routeCommunitiesViewMembers, routeCommunitiesViewEdit, routeCommunitiesViewOverview],
};
