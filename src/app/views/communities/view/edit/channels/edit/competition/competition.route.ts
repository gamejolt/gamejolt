import { RouteRecordRaw } from 'vue-router';

import { routeCommunitiesViewEditChannelsCompetitionAssignAwards } from '~app/views/communities/view/edit/channels/edit/competition/assign-awards/assign-awards.route';
import { routeCommunitiesViewEditChannelsCompetitionEntries } from '~app/views/communities/view/edit/channels/edit/competition/entries/entries.route';
import { routeCommunitiesViewEditChannelsCompetitionOverview } from '~app/views/communities/view/edit/channels/edit/competition/overview/overview.route';
import { routeCommunitiesViewEditChannelsCompetitionSettings } from '~app/views/communities/view/edit/channels/edit/competition/settings/settings.route';
import { routeCommunitiesViewEditChannelsCompetitionVoting } from '~app/views/communities/view/edit/channels/edit/competition/voting/voting.route';

export const routeCommunitiesViewEditChannelsCompetition: RouteRecordRaw = {
	path: 'jam',
	component: () =>
		import(
			'~app/views/communities/view/edit/channels/edit/competition/RouteCommunitiesViewEditChannelsCompetition.vue'
		),
	children: [
		routeCommunitiesViewEditChannelsCompetitionSettings,
		routeCommunitiesViewEditChannelsCompetitionOverview,
		routeCommunitiesViewEditChannelsCompetitionVoting,
		routeCommunitiesViewEditChannelsCompetitionEntries,
		routeCommunitiesViewEditChannelsCompetitionAssignAwards,
	],
};
