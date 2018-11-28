import { RouteConfig } from 'vue-router';

export const routeHome: RouteConfig = {
	name: 'home',
	path: '/',
	props: true,
	component: () => import(/* webpackChunkName: "routeHome" */ './home'),
};
