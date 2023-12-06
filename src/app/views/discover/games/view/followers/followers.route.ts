import { RouteRecordRaw } from 'vue-router';

export const routeDiscoverGamesViewFollowers: RouteRecordRaw = {
	name: 'discover.games.view.followers',
	path: 'followers',
	component: () => import('./RouteProfileFollowers.vue'),
};
