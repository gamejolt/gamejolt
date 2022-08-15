import { RouteRecordRaw } from 'vue-router';
import { routeLibraryCollectionRoutes } from './collection/collection.route';
import { routeLibraryOverview } from './overview/overview.route';

const children: RouteRecordRaw[] = [routeLibraryOverview, ...routeLibraryCollectionRoutes];

export const routeLibrary: RouteRecordRaw = {
	name: 'library',
	path: '/library',
	component: () => import('./library'),
	children,
};
