import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../lib/gj-lib-client/utils/utils';
import { routeSearchResults } from './results/results.route';
import { routeSearchGames } from './games/games.route';
import { routeSearchDevlogs } from './devlogs/devlogs.route';
import { routeSearchUsers } from './users/users.route';

export const routeSearch: VueRouter.RouteConfig = {
	name: 'search',
	path: '/search',
	props: true,
	component: () => asyncComponentLoader($import('./search')),
	children: [
		routeSearchResults,
		routeSearchGames,
		routeSearchDevlogs,
		routeSearchUsers,
	],
};
