import { RouteRecordRaw } from 'vue-router';
import { routeLibraryCollectionRoutes } from './collection/collection.route';
import { routeLibraryOverview } from './overview/overview.route';

const children: RouteRecordRaw[] = [routeLibraryOverview, ...routeLibraryCollectionRoutes];

if (GJ_IS_DESKTOP_APP) {
	children.push((await import('./installed/installed.route')).routeLibraryInstalled);
}

export const routeLibrary: RouteRecordRaw = {
	path: '/library',
	component: () => import('./library'),
	children,
};
