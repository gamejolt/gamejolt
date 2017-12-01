import { RouteConfig } from 'vue-router';

export const routeDiscoverDevlogsGames: RouteConfig = {
	name: 'discover.devlogs.games',
	path: 'games/:section?',
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverDevlogs" */ './games'),
};
