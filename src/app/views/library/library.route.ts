import { RouteConfig } from 'vue-router';

import { routeLibraryOverview } from './overview/overview.route';
import { routeLibraryCollectionRoutes } from './collection/collection.route';

const children: RouteConfig[] = [routeLibraryOverview, ...routeLibraryCollectionRoutes];

if (GJ_IS_CLIENT) {
	children.push(require('./installed/installed.route').routeLibraryInstalled);
}

export const routeLibrary: RouteConfig = {
	path: '/library',
	props: true,
	component: () => import(/* webpackChunkName: "routeLibrary" */ './library'),
	children,
};
