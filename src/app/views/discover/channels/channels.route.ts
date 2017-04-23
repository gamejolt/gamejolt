import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';
import { routeDiscoverChannelsList } from './list/list.route';
import { routeDiscoverChannelsView } from './view/view.route';

export const routeDiscoverChannels: VueRouter.RouteConfig = {
	name: 'discover.channels',
	path: '/channels',
	props: true,
	component: () => asyncComponentLoader( $import( './channels' ) ),
	children: [
		routeDiscoverChannelsList,
		routeDiscoverChannelsView,
	],
};
