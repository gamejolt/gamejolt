import { RouteConfig } from 'vue-router';

export const routeDiscoverGamesViewOverview: RouteConfig = {
	name: 'discover.games.view.overview',
	path: '/games/:slug/:id(\\d+)',
	component: () => import(/* webpackChunkName: "routeDiscoverGamesView" */ './overview.vue'),
};
