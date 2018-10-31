import { RouteConfig } from 'vue-router';
import RouteDiscoverHome from './home';

export const routeDiscoverHome: RouteConfig = {
	name: 'discover.home',
	path: '/explore',
	props: true,
	component: RouteDiscoverHome,
};
