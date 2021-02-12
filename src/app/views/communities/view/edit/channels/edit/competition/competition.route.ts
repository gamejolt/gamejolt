import { RouteConfig } from 'vue-router';
import { routeCommunitiesViewEditChannelsCompetitionAssignAwards } from './assign-awards/assign-awards.route';
import { routeCommunitiesViewEditChannelsCompetitionEntries } from './entries/entries.route';
import { routeCommunitiesViewEditChannelsCompetitionOverview } from './overview/overview.route';
import { routeCommunitiesViewEditChannelsCompetitionSettings } from './settings/settings.route';
import { routeCommunitiesViewEditChannelsCompetitionVoting } from './voting/voting.route';

export const routeCommunitiesViewEditChannelsCompetition: RouteConfig = {
	path: 'jam',
	component: () =>
		import(
			/* webpackChunkName: "routeCommunitiesViewEditChannelCompetitions" */ './competition.vue'
		),
	children: [
		routeCommunitiesViewEditChannelsCompetitionSettings,
		routeCommunitiesViewEditChannelsCompetitionOverview,
		routeCommunitiesViewEditChannelsCompetitionVoting,
		routeCommunitiesViewEditChannelsCompetitionEntries,
		routeCommunitiesViewEditChannelsCompetitionAssignAwards,
	],
};
