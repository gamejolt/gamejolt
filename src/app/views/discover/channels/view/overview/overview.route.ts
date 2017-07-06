import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../lib/gj-lib-client/utils/utils';

export const routeDiscoverChannelsViewOverview: VueRouter.RouteConfig = {
	name: 'discover.channels.view.overview',
	path: '/channels/:channel',
	props: true,
	component: () => asyncComponentLoader(import('./overview')),
};
