import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewEditChannelsCompetitionOverview: RouteConfig = {
	name: 'communities.view.edit.channels.competition.overview',
	path: '/c/:path/edit/:id(\\d+)/channels/:channel/jam',
	component: () =>
		import(
			/* webpackChunkName: "routeCommunitiesViewEditChannelCompetitions" */ './overview.vue'
		),
};
