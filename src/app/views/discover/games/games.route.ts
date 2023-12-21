import { RouteRecordRaw } from 'vue-router';
import {
	routeDiscoverGamesListDate,
	routeDiscoverGamesListSection,
	routeDiscoverGamesListTag,
} from './list/list.route';
import { routeDiscoverGamesView } from './view/view.route';

export const routeDiscoverGames: RouteRecordRaw = {
	path: '/games',
	component: () => import('./RouteDiscoverGames.vue'),
	children: [
		routeDiscoverGamesListSection,
		routeDiscoverGamesListTag,
		routeDiscoverGamesListDate,
		routeDiscoverGamesView,
	],
};
