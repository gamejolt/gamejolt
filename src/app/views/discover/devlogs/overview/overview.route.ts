import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';

export const routeDiscoverDevlogsOverview: VueRouter.RouteConfig = {
	name: 'discover.devlogs.overview',
	path: '/devlogs',
	component: () => asyncComponentLoader( $import( './overview' ) ),
	meta: {
		noAutoScroll: true,
	},
};
