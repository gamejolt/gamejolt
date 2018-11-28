import { RouteConfig } from 'vue-router';
import { routeLibraryCollectionRoutes } from './collection/collection.route';
import { routeLibraryOverview } from './overview/overview.route';

const children: RouteConfig[] = [routeLibraryOverview, ...routeLibraryCollectionRoutes];

if (GJ_IS_CLIENT) {
	children.push(require('./installed/installed.route').routeLibraryInstalled);
}

export const routeLibrary: RouteConfig = {
	path: '/library',
	component: () => import(/* webpackChunkName: "routeLibrary" */ './library'),
	children,
};
