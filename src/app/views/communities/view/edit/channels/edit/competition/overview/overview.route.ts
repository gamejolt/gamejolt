import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewEditChannelsCompetitionOverview: RouteConfig = {
	name: 'communities.view.edit.channels.competition.overview',
	path: '',
	component: () =>
		import(
			/* webpackChunkName: "routeCommunitiesViewEditChannelCompetitions" */ './overview.vue'
		),
};
