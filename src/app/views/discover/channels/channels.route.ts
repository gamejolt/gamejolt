import { RouteConfig } from 'vue-router';

import { routeDiscoverChannelsList } from './list/list.route';
import { routeDiscoverChannelsView } from './view/view.route';

export const routeDiscoverChannels: RouteConfig = {
	name: 'discover.channels',
	path: '/channels',
	props: true,
	component: () => import(/* webpackChunkName: "routeDiscoverChannels" */ './channels'),
	children: [routeDiscoverChannelsList, routeDiscoverChannelsView],
};
