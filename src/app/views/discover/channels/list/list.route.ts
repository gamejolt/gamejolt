import { RouteConfig } from 'vue-router';

export const routeDiscoverChannelsList: RouteConfig = {
	name: 'discover.channels.list',
	path: '/channels',
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverChannels" */ './list'),
};
