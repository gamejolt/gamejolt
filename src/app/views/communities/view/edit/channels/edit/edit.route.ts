import { RouteRecordRaw } from 'vue-router';
import { routeCommunitiesViewEditChannelsCompetition } from './competition/competition.route';
import { routeCommunitiesViewEditChannelsOverview } from './overview/overview.route';

export const routeCommunitiesViewEditChannelsEdit: RouteRecordRaw = {
	path: ':channel',
	component: () => import('./RouteCommunitiesViewEditChannelsEdit.vue'),
	children: [
		routeCommunitiesViewEditChannelsOverview,
		routeCommunitiesViewEditChannelsCompetition,
	],
};
