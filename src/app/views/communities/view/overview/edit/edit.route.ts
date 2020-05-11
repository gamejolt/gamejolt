import { RouteConfig } from 'vue-router';
import { routeCommunitiesViewOverviewEditBlocks } from './blocks/blocks.route';
import { routeCommunitiesViewOverviewEditChannels } from './channels/channels.route';
import { routeCommunitiesViewOverviewEditDetails } from './details/details.route';
import { routeCommunitiesViewOverviewEditGames } from './games/games.route';
import { routeCommunitiesViewOverviewEditModerators } from './moderators/moderators.route';

export const routeCommunitiesViewOverviewEdit: RouteConfig = {
	path: 'edit/:id(\\d+)',
	component: () =>
		import(/* webpackChunkName: "routeCommunitiesViewOverviewEdit" */ './edit.vue'),
	children: [
		routeCommunitiesViewOverviewEditDetails,
		routeCommunitiesViewOverviewEditChannels,
		routeCommunitiesViewOverviewEditModerators,
		routeCommunitiesViewOverviewEditBlocks,
		routeCommunitiesViewOverviewEditGames,
	],
};
