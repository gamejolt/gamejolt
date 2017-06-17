import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';

export const routeDiscoverChannelsList: VueRouter.RouteConfig = {
	name: 'discover.channels.list',
	path: '/channels',
	props: true,
	component: () => asyncComponentLoader($import('./list')),
};
