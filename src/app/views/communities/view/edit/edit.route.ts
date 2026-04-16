import { RouteRecordRaw } from 'vue-router';

import { routeCommunitiesViewEditActivity } from '~app/views/communities/view/edit/activity/activity.route';
import { routeCommunitiesViewEditBlocks } from '~app/views/communities/view/edit/blocks/blocks.route';
import { routeCommunitiesViewEditChannels } from '~app/views/communities/view/edit/channels/channels.route';
import { routeCommunitiesViewEditDetails } from '~app/views/communities/view/edit/details/details.route';
import { routeCommunitiesViewEditGames } from '~app/views/communities/view/edit/games/games.route';
import { routeCommunitiesViewEditModerators } from '~app/views/communities/view/edit/moderators/moderators.route';

export const routeCommunitiesViewEdit: RouteRecordRaw = {
	path: 'edit/:id(\\d+)',
	component: () => import('~app/views/communities/view/edit/RouteCommunitiesViewEdit.vue'),
	children: [
		routeCommunitiesViewEditDetails,
		routeCommunitiesViewEditChannels,
		routeCommunitiesViewEditModerators,
		routeCommunitiesViewEditBlocks,
		routeCommunitiesViewEditGames,
		routeCommunitiesViewEditActivity,
	],
};
