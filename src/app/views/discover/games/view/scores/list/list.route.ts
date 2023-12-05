import { RouteRecordRaw } from 'vue-router';

export const routeDiscoverGamesViewScoresList: RouteRecordRaw = {
	name: 'discover.games.view.scores.list',
	path: 'scores/:tableId(\\d+)/:type(best|user)',
	component: () => import('./RouteDiscoverGamesViewScoresList.vue'),
};
