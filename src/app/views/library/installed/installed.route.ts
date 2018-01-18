import { RouteConfig } from 'vue-router';

export const routeLibraryInstalled: RouteConfig = {
	name: 'library.installed',
	path: '/installed',
	props: true,
	component: () => import(/* webpackChunkName: "routeLibraryInstalled" */ './installed'),
};
