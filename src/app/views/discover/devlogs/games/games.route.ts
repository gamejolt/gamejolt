import VueRouter from 'vue-router';

export const routeDiscoverDevlogsGames: VueRouter.RouteConfig = {
	name: 'discover.devlogs.games',
	path: 'games/:section?',
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverDevlogs" */ './games'),
};
