import { RouteConfig } from 'vue-router';

export const routeDiscoverGamesViewTrophiesList: RouteConfig = {
	name: 'discover.games.view.trophies.list',
	path: 'trophies',
	component: () => import(/* webpackChunkName: "routeDiscoverGamesViewAchievements" */ './list'),
};
