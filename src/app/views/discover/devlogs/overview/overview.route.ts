import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';

export const routeDiscoverDevlogsOverview: VueRouter.RouteConfig = {
	name: 'discover.devlogs.overview',
	path: '/devlogs',
	props: true,
	component: () => asyncComponentLoader($import('./overview')),
};
