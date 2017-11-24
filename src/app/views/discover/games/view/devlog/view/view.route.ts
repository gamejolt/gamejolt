import { RouteConfig } from 'vue-router';

export const routeDiscoverGamesViewDevlogView: RouteConfig = {
	name: 'discover.games.view.devlog.view',
	path: 'devlog/:postSlug',
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverGamesView" */ './view'),
};
