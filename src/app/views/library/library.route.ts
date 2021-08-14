import { RouteRecordRaw } from 'vue-router';
import { routeLibraryCollectionRoutes } from './collection/collection.route';
import { routeLibraryOverview } from './overview/overview.route';

const children: RouteRecordRaw[] = [routeLibraryOverview, ...routeLibraryCollectionRoutes];

if (GJ_IS_CLIENT) {
	children.push(require('./installed/installed.route').routeLibraryInstalled);
}

export const routeLibrary: RouteRecordRaw = {
	path: '/library',
	component: () => import(/* webpackChunkName: "routeLibrary" */ './library'),
	children,
};
