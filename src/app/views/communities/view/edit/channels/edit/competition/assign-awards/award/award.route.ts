import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewEditChannelsCompetitionAssignAwardsAward: RouteConfig = {
	name: 'communities.view.edit.channels.competition.assign-awards.award',
	path: ':awardId(\\d+)',
	component: () =>
		import(/* webpackChunkName: "routeCommunitiesViewEditChannelCompetitions" */ './award.vue'),
};
