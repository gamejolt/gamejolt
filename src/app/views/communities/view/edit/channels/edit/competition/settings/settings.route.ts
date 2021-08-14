import { RouteRecordRaw } from 'vue-router';

export const routeCommunitiesViewEditChannelsCompetitionSettings: RouteRecordRaw = {
	name: 'communities.view.edit.channels.competition.settings',
	path: 'settings',
	component: () =>
		import(
			/* webpackChunkName: "routeCommunitiesViewEditChannelCompetitions" */ './settings.vue'
		),
};
