import { RouteConfig } from 'vue-router';

export const routeCommunitiesViewEditChannelsCompetitionSettings: RouteConfig = {
	name: 'communities.view.edit.channels.competition.settings',
	path: 'settings',
	component: () =>
		import(
			/* webpackChunkName: "routeCommunitiesViewEditChannelCompetitions" */ './settings.vue'
		),
};
