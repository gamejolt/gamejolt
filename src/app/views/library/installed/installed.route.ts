import VueRouter from 'vue-router';

export const routeLibraryInstalled: VueRouter.RouteConfig = {
	name: 'library.installed',
	path: '/installed',
	props: true,
	component: () => import(/* webpackChunkName: "routeLibraryInstalled" */ './installed'),
};
