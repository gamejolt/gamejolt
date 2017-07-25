import VueRouter from 'vue-router';

export const routeLibraryOverview: VueRouter.RouteConfig = {
	name: 'library.overview',
	path: '/library',
	props: true,
	component: () => import(/* webpackChunkName: "routeLibraryOverview" */ './overview'),
};
