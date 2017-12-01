import { RouteConfig } from 'vue-router';

export const routeSearchUsers: RouteConfig = {
	name: 'search.users',
	path: 'users',
	props: true,
	component: () => import(/* webpackChunkName: "routeSearch" */ './users'),
};
