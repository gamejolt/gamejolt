import { RouteConfig } from 'vue-router';
import { routeDiscoverChannelsViewGames } from './games/games.route';
import { routeDiscoverChannelsViewOverview } from './overview/overview.route';

export const routeDiscoverChannelsView: RouteConfig = {
	name: 'discover.channels.view',
	path: ':channel',
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverChannels" */ './view'),
	children: [routeDiscoverChannelsViewOverview, routeDiscoverChannelsViewGames],
};
