import VueRouter from 'vue-router';
import { routeDiscoverGamesListSection, routeDiscoverGamesListCategory, routeDiscoverGamesListDate } from './list/list.route';
import { routeDiscoverGamesView } from './view/view.route';
import RouteDiscoverGames from './games';

export const routeDiscoverGames: VueRouter.RouteConfig = {
	path: 'games',
	component: RouteDiscoverGames,
	children: [
		routeDiscoverGamesListSection,
		routeDiscoverGamesListCategory,
		routeDiscoverGamesListDate,
		routeDiscoverGamesView,
	]
};
