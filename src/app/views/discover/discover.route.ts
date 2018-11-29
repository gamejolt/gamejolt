import { RouteConfig } from 'vue-router';
import RouteDiscover from './discover';
import { routeDiscoverGames } from './games/games.route';
import { routeDiscoverHome } from './home/home.route';

export const routeDiscover: RouteConfig = {
	path: '',
	component: RouteDiscover,
	children: [routeDiscoverHome, routeDiscoverGames],
};
