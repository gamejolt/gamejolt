import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewEditChannelsCompetitionEntries: RouteConfig = {
	name: 'communities.view.edit.channels.competition.entries',
	path: 'entries',
	component: () =>
		import(
			/* webpackChunkName: "routeCommunitiesViewEditChannelCompetitions" */ './entries.vue'
		),
};
