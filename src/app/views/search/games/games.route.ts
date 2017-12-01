import { RouteConfig } from 'vue-router';

export const routeSearchGames: RouteConfig = {
	name: 'search.games',
	path: 'games',
	props: true,
	component: () => import(/* webpackChunkName: "routeSearch" */ './games'),
};
