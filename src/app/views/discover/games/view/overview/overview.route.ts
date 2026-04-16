import { RouteRecordRaw } from 'vue-router';

export const routeDiscoverGamesViewOverview: RouteRecordRaw = {
	name: 'discover.games.view.overview',
	path: '',
	component: () => import('~app/views/discover/games/view/overview/RouteDiscoverGamesViewOverview.vue'),
};
