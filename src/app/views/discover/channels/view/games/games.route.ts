import VueRouter from 'vue-router';

export const routeDiscoverChannelsViewGames: VueRouter.RouteConfig = {
	name: 'discover.channels.view.games',
	path: 'games/:section?',
	props: true,
	component: () => import('./games'),
};
