import VueRouter from 'vue-router';

export const routeDiscoverChannelsViewDevlogs: VueRouter.RouteConfig = {
	name: 'discover.channels.view.devlogs',
	path: 'devlogs/:section?',
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverChannels" */ './devlogs'),
};
