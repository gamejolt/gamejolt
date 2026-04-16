import { RouteRecordRaw } from 'vue-router';

import { routeSearchCommunities } from '~app/views/search/communities/communities.route';
import { routeSearchGames } from '~app/views/search/games/games.route';
import { routeSearchRealms } from '~app/views/search/realms/realms.route';
import { routeSearchResults } from '~app/views/search/results/results.route';
import { routeSearchUsers } from '~app/views/search/users/users.route';

export const routeSearch: RouteRecordRaw = {
	path: '/search',
	component: () => import('~app/views/search/RouteSearch.vue'),
	children: [
		routeSearchResults,
		routeSearchCommunities,
		routeSearchGames,
		routeSearchUsers,
		routeSearchRealms,
	],
};
