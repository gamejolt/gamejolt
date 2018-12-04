import { RouteConfig } from 'vue-router';

export const routeSearchGames: RouteConfig = {
	name: 'search.games',
	path: 'games',
	component: () => import(/* webpackChunkName: "routeSearch" */ './games'),
};
