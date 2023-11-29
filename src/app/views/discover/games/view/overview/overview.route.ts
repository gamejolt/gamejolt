import { RouteRecordRaw } from 'vue-router';

export const routeDiscoverGamesViewOverview: RouteRecordRaw = {
	name: 'discover.games.view.overview',
	path: '',
	component: () => import('./RouteDiscoverGamesViewOverview.vue'),
};
