import { RouteRecordRaw } from 'vue-router';

import { routeDiscoverCommunities } from '~app/views/discover/communities/communities.route';
import { routeDiscoverGames } from '~app/views/discover/games/games.route';
import { routeDiscoverHome } from '~app/views/discover/home/home.route';
import RouteDiscover from '~app/views/discover/RouteDiscover.vue';

export const routeDiscover: RouteRecordRaw = {
	// TODO(vue3): better solution
	path: '/discover',
	component: RouteDiscover,
	children: [routeDiscoverHome, routeDiscoverGames, routeDiscoverCommunities],
};
