import { RouteConfig } from 'vue-router';

export const routeLibraryOverview: RouteConfig = {
	name: 'library.overview',
	path: '/library',
	props: true,
	component: () => import(/* webpackChunkName: "routeLibrary" */ './overview'),
};
