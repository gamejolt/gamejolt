import { RouteRecordRaw } from 'vue-router';

export const routeSearchGames: RouteRecordRaw = {
	name: 'search.games',
	path: 'games',
	component: () => import(/* webpackChunkName: "routeSearch" */ './games.vue'),
};
