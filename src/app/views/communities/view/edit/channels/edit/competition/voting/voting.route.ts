import { RouteRecordRaw } from 'vue-router';

export const routeCommunitiesViewEditChannelsCompetitionVoting: RouteRecordRaw = {
	name: 'communities.view.edit.channels.competition.voting',
	path: 'voting',
	component: () =>
		import('~app/views/communities/view/edit/channels/edit/competition/voting/RouteCommunitiesViewEditChannelsCompetitionVoting.vue'),
};
