import { RouteConfig } from 'vue-router';

export const routeDiscoverGamesViewDevlogList: RouteConfig = {
	name: 'discover.games.view.devlog.list',
	path: 'devlog',
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverGamesView" */ './list'),
};
