import { RouteConfig } from 'vue-router';

import { routeSearchResults } from './results/results.route';
import { routeSearchGames } from './games/games.route';
import { routeSearchDevlogs } from './devlogs/devlogs.route';
import { routeSearchUsers } from './users/users.route';

export const routeSearch: RouteConfig = {
	name: 'search',
	path: '/search',
	props: true,
	component: () => import(/* webpackChunkName: "routeSearch" */ './search'),
	children: [routeSearchResults, routeSearchGames, routeSearchDevlogs, routeSearchUsers],
};
