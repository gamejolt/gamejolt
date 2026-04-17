import { RouteRecordRaw } from 'vue-router';

export const routeDiscoverGamesViewTrophiesList: RouteRecordRaw = {
	name: 'discover.games.view.trophies.list',
	path: 'trophies',
	component: () =>
		import(
			'~app/views/discover/games/view/trophies/list/RouteDiscoverGamesViewTrophiesList.vue'
		),
};
