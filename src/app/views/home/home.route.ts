import { RouteConfig } from 'vue-router';
import RouteHome from './home';

export const routeHome: RouteConfig = {
	name: 'home',
	path: '/',
	// Don't async load this since it's a small route that passes on to other
	// components.
	component: RouteHome,
};
