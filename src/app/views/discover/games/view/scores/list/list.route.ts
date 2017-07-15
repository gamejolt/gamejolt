import VueRouter from 'vue-router';

export const routeDiscoverGamesViewScoresList: VueRouter.RouteConfig = {
	name: 'discover.games.view.scores.list',
	path: 'scores/:tableId(\\d+)/:type',
	props: true,
	component: () => import('./list'),
};
