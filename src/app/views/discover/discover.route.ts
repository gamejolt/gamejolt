import VueRouter from 'vue-router';
import RouteDiscover from './discover';
import { routeDiscoverHome } from './home/home.route';
import { routeDiscoverGames } from './games/games.route';
import { routeDiscoverDevlogs } from './devlogs/devlogs.route';
import { routeDiscoverChannels } from './channels/channels.route';

export const routeDiscover: VueRouter.RouteConfig = {
	path: '/',
	props: true,
	component: RouteDiscover,
	children: [
		routeDiscoverHome,
		routeDiscoverGames,
		routeDiscoverDevlogs,
		routeDiscoverChannels,
	]
};
