import VueRouter from 'vue-router';

export const routeDiscoverChannelsList: VueRouter.RouteConfig = {
	name: 'discover.channels.list',
	path: '/channels',
	props: true,
	component: () => import('./list'),
};
