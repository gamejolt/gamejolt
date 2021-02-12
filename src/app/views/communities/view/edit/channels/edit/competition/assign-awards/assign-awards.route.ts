import { RouteConfig } from 'vue-router';
import { routeCommunitiesViewEditChannelsCompetitionAssignAwardsAward } from './award/award.route';

export const routeCommunitiesViewEditChannelsCompetitionAssignAwards: RouteConfig = {
	name: 'communities.view.edit.channels.competition.assign-awards',
	path: 'assign-awards',
	component: () =>
		import(
			/* webpackChunkName: "routeCommunitiesViewEditChannelCompetitions" */ './assign-awards.vue'
		),
	children: [routeCommunitiesViewEditChannelsCompetitionAssignAwardsAward],
};
