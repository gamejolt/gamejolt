import { RouteConfig } from 'vue-router';

export const routeSearchUsers: RouteConfig = {
	name: 'search.users',
	path: 'users',
	component: () => import(/* webpackChunkName: "routeSearch" */ './users'),
};
