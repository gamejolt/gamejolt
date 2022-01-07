import { RouteRecordRaw } from 'vue-router';
import { routeDiscoverCommunities } from './communities/communities.route';
import RouteDiscover from './discover';
import { routeDiscoverGames } from './games/games.route';
import { routeDiscoverHome } from './home/home.route';

export const routeDiscover: RouteRecordRaw = {
	// TODO(vue3): better solution
	path: '/discover',
	component: RouteDiscover,
	children: [routeDiscoverHome, routeDiscoverGames, routeDiscoverCommunities],
};
