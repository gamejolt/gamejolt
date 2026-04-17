import { RouteRecordRaw } from 'vue-router';

import { routeCommunitiesViewEditChannelsCompetition } from '~app/views/communities/view/edit/channels/edit/competition/competition.route';
import { routeCommunitiesViewEditChannelsOverview } from '~app/views/communities/view/edit/channels/edit/overview/overview.route';

export const routeCommunitiesViewEditChannelsEdit: RouteRecordRaw = {
	path: ':channel',
	component: () =>
		import(
			'~app/views/communities/view/edit/channels/edit/RouteCommunitiesViewEditChannelsEdit.vue'
		),
	children: [
		routeCommunitiesViewEditChannelsOverview,
		routeCommunitiesViewEditChannelsCompetition,
	],
};
