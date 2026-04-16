import { RouteRecordRaw } from 'vue-router';

import { routeCommunitiesViewEditChannelsCompetitionAssignAwardsAward } from '~app/views/communities/view/edit/channels/edit/competition/assign-awards/award/award.route';

export const routeCommunitiesViewEditChannelsCompetitionAssignAwards: RouteRecordRaw = {
	name: 'communities.view.edit.channels.competition.assign-awards',
	path: 'assign-awards',
	component: () => import('~app/views/communities/view/edit/channels/edit/competition/assign-awards/RouteCommunitiesViewEditChannelsCompetitionAssignAwards.vue'),
	children: [routeCommunitiesViewEditChannelsCompetitionAssignAwardsAward],
};
