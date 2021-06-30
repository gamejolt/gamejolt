import { RouteConfig } from 'vue-router';
import { routeDiscoverCommunities } from './communities/communities.route';
import RouteDiscover from './discover';
import { routeDiscoverFiresides } from './firesides/firesides.route';
import { routeDiscoverGames } from './games/games.route';
import { routeDiscoverHome } from './home/home.route';

export const routeDiscover: RouteConfig = {
	path: '',
	component: RouteDiscover,
	children: [
		routeDiscoverHome,
		routeDiscoverGames,
		routeDiscoverCommunities,
		routeDiscoverFiresides,
	],
};
