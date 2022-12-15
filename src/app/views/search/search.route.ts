import { RouteRecordRaw } from 'vue-router';
import { routeSearchCommunities } from './communities/communities.route';
import { routeSearchGames } from './games/games.route';
import { routeSearchRealms } from './realms/realms.route';
import { routeSearchResults } from './results/results.route';
import { routeSearchUsers } from './users/users.route';

export const routeSearch: RouteRecordRaw = {
	path: '/search',
	component: () => import('./RouteSearch.vue'),
	children: [
		routeSearchResults,
		routeSearchCommunities,
		routeSearchGames,
		routeSearchUsers,
		routeSearchRealms,
	],
};
