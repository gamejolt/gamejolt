import VueRouter from 'vue-router';

export const routeDiscoverGamesViewDevlogList: VueRouter.RouteConfig = {
	name: 'discover.games.view.devlog.list',
	path: 'devlog',
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverGamesView" */ './list'),
};
