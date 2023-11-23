import { RouteRecordRaw } from 'vue-router';

export const routeCommunitiesViewEditChannelsCompetitionEntries: RouteRecordRaw = {
	name: 'communities.view.edit.channels.competition.entries',
	path: 'entries',
	component: () => import('./RouteCommunitiesViewEditChannelsCompetitionEntries.vue'),
};
