import { RouteRecordRaw } from 'vue-router';
import RouteDiscoverGames from './games';
import {
	routeDiscoverGamesListDate,
	routeDiscoverGamesListSection,
	routeDiscoverGamesListTag,
} from './list/list.route';
import { routeDiscoverGamesView } from './view/view.route';

export const routeDiscoverGames: RouteRecordRaw = {
	path: '/games',
	component: RouteDiscoverGames,
	children: [
		routeDiscoverGamesListSection,
		routeDiscoverGamesListTag,
		routeDiscoverGamesListDate,
		routeDiscoverGamesView,
	],
};
