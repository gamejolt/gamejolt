import { RouteRecordRaw } from 'vue-router';

import {
	routeDiscoverGamesListDate,
	routeDiscoverGamesListSection,
	routeDiscoverGamesListTag,
} from '~app/views/discover/games/list/list.route';
import { routeDiscoverGamesView } from '~app/views/discover/games/view/view.route';

export const routeDiscoverGames: RouteRecordRaw = {
	path: '/games',
	component: () => import('~app/views/discover/games/RouteDiscoverGames.vue'),
	children: [
		routeDiscoverGamesListSection,
		routeDiscoverGamesListTag,
		routeDiscoverGamesListDate,
		routeDiscoverGamesView,
	],
};
