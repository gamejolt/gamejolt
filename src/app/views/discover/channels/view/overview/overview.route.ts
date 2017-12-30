import { RouteConfig } from 'vue-router';

export const routeDiscoverChannelsViewOverview: RouteConfig = {
	name: 'discover.channels.view.overview',
	path: '/channels/:channel',
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverChannels" */ './overview'),
};
