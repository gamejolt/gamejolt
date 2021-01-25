import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewEditChannelsCompetitionVoting: RouteConfig = {
	name: 'communities.view.edit.channels.competition.voting',
	path: 'voting',
	component: () =>
		import(
			/* webpackChunkName: "routeCommunitiesViewEditChannelCompetitions" */ './voting.vue'
		),
};
