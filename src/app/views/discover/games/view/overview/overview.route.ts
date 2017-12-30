import { RouteConfig } from 'vue-router';

export const routeDiscoverGamesViewOverview: RouteConfig = {
	name: 'discover.games.view.overview',
	path: '/games/:slug/:id(\\d+)',
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverGamesView" */ './overview'),
};
