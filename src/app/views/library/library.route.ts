import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../lib/gj-lib-client/utils/utils';
import { routeLibraryOverview } from './overview/overview.route';
import { routeLibraryCollectionRoutes } from './collection/collection.route';

export const routeLibrary: VueRouter.RouteConfig = {
	path: '/library',
	props: true,
	component: () => asyncComponentLoader( $import( './library' ) ),
	children: [
		routeLibraryOverview,
		...routeLibraryCollectionRoutes,
	],
};
