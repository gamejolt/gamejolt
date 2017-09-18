import VueRouter from 'vue-router';

export const routeDiscoverGamesViewOverview: VueRouter.RouteConfig = {
	name: 'discover.games.view.overview',
	path: '/@:username/:slug',
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverGamesView" */ './overview'),
};
