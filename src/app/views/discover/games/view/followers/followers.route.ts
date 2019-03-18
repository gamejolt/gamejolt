import { RouteConfig } from 'vue-router';

export const routeDiscoverGamesViewFollowers: RouteConfig = {
	name: 'discover.games.view.followers',
	path: 'followers',
	component: () =>
		import(/* webpackChunkName: "routeDiscoverGamesViewFollowers" */ './followers.vue'),
};
