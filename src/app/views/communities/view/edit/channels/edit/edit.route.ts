import { RouteConfig } from 'vue-router';
import { routeCommunitiesViewEditChannelsCompetition } from './competition/competition.route';
import { routeCommunitiesViewEditChannelsOverview } from './overview/overview.route';

export const routeCommunitiesViewEditChannelsEdit: RouteConfig = {
	path: ':channel',
	component: () => import(/* webpackChunkName: "routeCommunitiesViewEditChannel" */ './edit.vue'),
	children: [
		routeCommunitiesViewEditChannelsOverview,
		routeCommunitiesViewEditChannelsCompetition,
	],
};
