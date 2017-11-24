import { RouteConfig } from 'vue-router';

import { routeLibraryOverview } from './overview/overview.route';
import { routeLibraryCollectionRoutes } from './collection/collection.route';

export const routeLibrary: RouteConfig = {
	path: '/library',
	props: true,
	component: () => import(/* webpackChunkName: "routeLibrary" */ './library'),
	children: [routeLibraryOverview, ...routeLibraryCollectionRoutes],
};
