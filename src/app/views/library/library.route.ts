import { RouteRecordRaw } from 'vue-router';

import { routeLibraryCollectionRoutes } from '~app/views/library/collection/collection.route';
import { routeLibraryOverview } from '~app/views/library/overview/overview.route';

const children: RouteRecordRaw[] = [routeLibraryOverview, ...routeLibraryCollectionRoutes];

export const routeLibrary: RouteRecordRaw = {
	name: 'library',
	path: '/library',
	component: () => import('~app/views/library/RouteLibrary.vue'),
	children,
};
