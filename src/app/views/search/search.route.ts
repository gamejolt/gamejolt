import { RouteConfig } from 'vue-router';
import { routeSearchDevlogs } from './devlogs/devlogs.route';
import { routeSearchGames } from './games/games.route';
import { routeSearchResults } from './results/results.route';
import { routeSearchUsers } from './users/users.route';

export const routeSearch: RouteConfig = {
	path: '/search',
	props: true,
	component: () => import(/* webpackChunkName: "routeSearch" */ './search'),
	children: [routeSearchResults, routeSearchGames, routeSearchDevlogs, routeSearchUsers],
};
