import VueRouter from 'vue-router';

import { routeLibraryOverview } from './overview/overview.route';
import { routeLibraryCollectionRoutes } from './collection/collection.route';
import { routeLibraryInstalled } from './installed/installed.route';

export const routeLibrary: VueRouter.RouteConfig = {
	path: '/library',
	props: true,
	component: () => import(/* webpackChunkName: "routeLibrary" */ './library'),
	children: [routeLibraryOverview, routeLibraryInstalled, ...routeLibraryCollectionRoutes],
};
