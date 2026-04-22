import { RouteRecordRaw } from 'vue-router';

export const routeCommunitiesViewEditChannelsCompetitionEntries: RouteRecordRaw = {
	name: 'communities.view.edit.channels.competition.entries',
	path: 'entries',
	component: () =>
		import('~app/views/communities/view/edit/channels/edit/competition/entries/RouteCommunitiesViewEditChannelsCompetitionEntries.vue'),
};
