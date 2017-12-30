import { RouteConfig } from 'vue-router';

export const routeDiscoverChannelsViewGames: RouteConfig = {
	name: 'discover.channels.view.games',
	path: 'games/:section?',
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverChannels" */ './games'),
};
