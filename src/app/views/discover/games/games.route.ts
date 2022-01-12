import { RouteRecordRaw } from 'vue-router';
import {
	routeDiscoverGamesListDate,
	routeDiscoverGamesListSection,
	routeDiscoverGamesListTag,
} from './list/list.route';
import RouteDiscoverGames from './RouteDiscoverGames.vue';
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
