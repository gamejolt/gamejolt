import VueRouter from 'vue-router';

export const routeSearchResults: VueRouter.RouteConfig = {
	name: 'search.results',
	path: '/search',
	props: true,
	component: () => import(/* webpackChunkName: "routeSearch" */ './results'),
};
