import { RouteConfig } from 'vue-router';

export const routeSearchResults: RouteConfig = {
	name: 'search.results',
	path: '/search',
	component: () => import(/* webpackChunkName: "routeSearch" */ './results.vue'),
};
