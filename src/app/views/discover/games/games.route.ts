import { RouteConfig } from 'vue-router';
import {
	routeDiscoverGamesListSection,
	routeDiscoverGamesListCategory,
	routeDiscoverGamesListDate,
} from './list/list.route';
import { routeDiscoverGamesView } from './view/view.route';
import RouteDiscoverGames from './games';

export const routeDiscoverGames: RouteConfig = {
	path: 'games',
	props: true,
	component: RouteDiscoverGames,
	children: [
		routeDiscoverGamesListSection,
		routeDiscoverGamesListCategory,
		routeDiscoverGamesListDate,
		routeDiscoverGamesView,
	],
};
