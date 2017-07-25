import VueRouter from 'vue-router';

import { routeDiscoverChannelsViewOverview } from './overview/overview.route';
import { routeDiscoverChannelsViewGames } from './games/games.route';
import { routeDiscoverChannelsViewDevlogs } from './devlogs/devlogs.route';

export const routeDiscoverChannelsView: VueRouter.RouteConfig = {
	name: 'discover.channels.view',
	path: ':channel',
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverChannelsView" */ './view'),
	children: [
		routeDiscoverChannelsViewOverview,
		routeDiscoverChannelsViewGames,
		routeDiscoverChannelsViewDevlogs,
	],
};
