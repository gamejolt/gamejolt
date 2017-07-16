import VueRouter from 'vue-router';

export const routeDiscoverGamesViewTrophiesList: VueRouter.RouteConfig = {
	name: 'discover.games.view.trophies.list',
	path: 'trophies',
	props: true,
	component: () => import('./list'),
};
