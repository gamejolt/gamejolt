import { RouteRecordRaw } from 'vue-router';
import { routeCommunitiesViewEditChannelsCompetitionAssignAwardsAward } from './award/award.route';

export const routeCommunitiesViewEditChannelsCompetitionAssignAwards: RouteRecordRaw = {
	name: 'communities.view.edit.channels.competition.assign-awards',
	path: 'assign-awards',
	component: () => import('./RouteCommunitiesViewEditChannelsCompetitionAssignAwards.vue'),
	children: [routeCommunitiesViewEditChannelsCompetitionAssignAwardsAward],
};
