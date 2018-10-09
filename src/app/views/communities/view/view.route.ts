import { RouteConfig } from 'vue-router';
import { routeCommunitiesViewMembers } from './members/members.route';
import { routeCommunitiesViewOverview } from './overview/overview.route';

export const routeCommunitiesView: RouteConfig = {
	name: 'communities.view',
	path: '/c/:path',
	props: true,
	component: () => import(/* webpackChunkName: "routeCommunitiesView" */ './view'),
	children: [routeCommunitiesViewOverview, routeCommunitiesViewMembers],
};
