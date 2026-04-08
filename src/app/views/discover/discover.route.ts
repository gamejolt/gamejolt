import { RouteRecordRaw } from 'vue-router';

import { routeDiscoverCommunities } from './communities/communities.route';
import { routeDiscoverGames } from './games/games.route';
import { routeDiscoverHome } from './home/home.route';
import RouteDiscover from './RouteDiscover.vue';

export const routeDiscover: RouteRecordRaw = {
	// TODO(vue3): better solution
	path: '/discover',
	component: RouteDiscover,
	children: [routeDiscoverHome, routeDiscoverGames, routeDiscoverCommunities],
};
