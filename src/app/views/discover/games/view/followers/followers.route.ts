import { RouteConfig } from 'vue-router';

export const routeDiscoverGamesViewFollowers: RouteConfig = {
	name: 'discover.games.view.followers',
	path: 'followers',
	props: true,
	component: () =>
		import(/* webpackChunkName: "routeDiscoverGamesViewFollowers" */ './followers'),
};
