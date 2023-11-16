import { RouteRecordRaw } from 'vue-router';

export const routeCommunitiesViewEditChannelsCompetitionAssignAwardsAward: RouteRecordRaw = {
	name: 'communities.view.edit.channels.competition.assign-awards.award',
	path: ':awardId(\\d+)',
	component: () => import('./RouteCommunitiesViewEditChannelsCompetitionAssignAwardsAward.vue'),
};
