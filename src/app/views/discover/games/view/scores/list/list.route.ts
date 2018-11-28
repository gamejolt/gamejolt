import { RouteConfig } from 'vue-router';

export const routeDiscoverGamesViewScoresList: RouteConfig = {
	name: 'discover.games.view.scores.list',
	path: 'scores/:tableId(\\d+)/:type(best|user)',
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverGamesViewAchievements" */ './list'),
};
