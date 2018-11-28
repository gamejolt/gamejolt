import { RouteConfig } from 'vue-router';
import RouteDiscoverGames from './games';
import {
	routeDiscoverGamesListDate,
	routeDiscoverGamesListSection,
	routeDiscoverGamesListTag,
} from './list/list.route';
import { routeDiscoverGamesView } from './view/view.route';

export const routeDiscoverGames: RouteConfig = {
	path: '/games',
	props: true,
	component: RouteDiscoverGames,
	children: [
		routeDiscoverGamesListSection,
		routeDiscoverGamesListTag,
		routeDiscoverGamesListDate,
		routeDiscoverGamesView,
	],
};
