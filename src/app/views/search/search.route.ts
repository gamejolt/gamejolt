import { RouteConfig } from 'vue-router';
import { routeSearchGames } from './games/games.route';
import { routeSearchResults } from './results/results.route';
import { routeSearchUsers } from './users/users.route';

export const routeSearch: RouteConfig = {
	path: '/search',
	component: () => import(/* webpackChunkName: "routeSearch" */ './search.vue'),
	children: [routeSearchResults, routeSearchGames, routeSearchUsers],
};
