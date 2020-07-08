import { RouteConfig } from 'vue-router';
import { routeCommunitiesViewEditBlocks } from './blocks/blocks.route';
import { routeCommunitiesViewEditChannels } from './channels/channels.route';
import { routeCommunitiesViewEditDetails } from './details/details.route';
import { routeCommunitiesViewEditGames } from './games/games.route';
import { routeCommunitiesViewEditModerators } from './moderators/moderators.route';

export const routeCommunitiesViewEdit: RouteConfig = {
	path: 'edit/:id(\\d+)',
	component: () => import(/* webpackChunkName: "routeCommunitiesViewEdit" */ './edit.vue'),
	children: [
		routeCommunitiesViewEditDetails,
		routeCommunitiesViewEditChannels,
		routeCommunitiesViewEditModerators,
		routeCommunitiesViewEditBlocks,
		routeCommunitiesViewEditGames,
	],
};
