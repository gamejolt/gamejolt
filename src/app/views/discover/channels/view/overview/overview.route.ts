import VueRouter from 'vue-router';

export const routeDiscoverChannelsViewOverview: VueRouter.RouteConfig = {
	name: 'discover.channels.view.overview',
	path: '/channels/:channel',
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverChannelsViewOverview" */ './overview'),
};
