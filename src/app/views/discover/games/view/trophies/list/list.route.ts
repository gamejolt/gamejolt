import { RouteConfig } from 'vue-router';

export const routeDiscoverGamesViewTrophiesList: RouteConfig = {
	name: 'discover.games.view.trophies.list',
	path: 'trophies',
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverGamesViewAchievements" */ './list'),
};
