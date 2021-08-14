import { RouteRecordRaw } from 'vue-router';

export const routeSearchResults: RouteRecordRaw = {
	name: 'search.results',
	path: '',
	component: () => import(/* webpackChunkName: "routeSearch" */ './results.vue'),
};
