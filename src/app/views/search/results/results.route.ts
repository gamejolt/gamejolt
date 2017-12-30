import { RouteConfig } from 'vue-router';

export const routeSearchResults: RouteConfig = {
	name: 'search.results',
	path: '/search',
	props: true,
	component: () => import(/* webpackChunkName: "routeSearch" */ './results'),
};
