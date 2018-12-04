import { RouteConfig } from 'vue-router';

export const routeLibraryOverview: RouteConfig = {
	name: 'library.overview',
	path: '/library',
	component: () => import(/* webpackChunkName: "routeLibrary" */ './overview'),
};
