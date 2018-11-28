import { RouteConfig } from 'vue-router';

export const routeHome: RouteConfig = {
	name: 'home',
	path: '/',
	component: () => import(/* webpackChunkName: "routeHome" */ './home'),
};
