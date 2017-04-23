import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';
import { routeDiscoverChannelsViewOverview } from './overview/overview.route';
import { routeDiscoverChannelsViewGames } from './games/games.route';
import { routeDiscoverChannelsViewDevlogs } from './devlogs/devlogs.route';

export const routeDiscoverChannelsView: VueRouter.RouteConfig = {
	name: 'discover.channels.view',
	path: ':channel',
	component: () => asyncComponentLoader( $import( './view' ) ),
	children: [
		routeDiscoverChannelsViewOverview,
		routeDiscoverChannelsViewGames,
		routeDiscoverChannelsViewDevlogs,
	],
};
