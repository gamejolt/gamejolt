import { RouteRecordRaw } from 'vue-router';
import { routeCommunitiesViewEditActivity } from './activity/activity.route';
import { routeCommunitiesViewEditBlocks } from './blocks/blocks.route';
import { routeCommunitiesViewEditChannels } from './channels/channels.route';
import { routeCommunitiesViewEditDetails } from './details/details.route';
import { routeCommunitiesViewEditGames } from './games/games.route';
import { routeCommunitiesViewEditModerators } from './moderators/moderators.route';

export const routeCommunitiesViewEdit: RouteRecordRaw = {
	path: 'edit/:id(\\d+)',
	component: () => import('./RouteCommunitiesViewEdit.vue'),
	children: [
		routeCommunitiesViewEditDetails,
		routeCommunitiesViewEditChannels,
		routeCommunitiesViewEditModerators,
		routeCommunitiesViewEditBlocks,
		routeCommunitiesViewEditGames,
		routeCommunitiesViewEditActivity,
	],
};
