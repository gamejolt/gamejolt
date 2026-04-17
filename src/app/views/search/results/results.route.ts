import { RouteRecordRaw } from 'vue-router';

export const routeSearchResults: RouteRecordRaw = {
	name: 'search.results',
	path: '',
	component: () => import('~app/views/search/results/RouteSearchResults.vue'),
};
