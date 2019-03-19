import { RouteConfig } from 'vue-router';

export const routeDiscoverHome: RouteConfig = {
	name: 'discover.home',
	path: '/discover',
	component: () => import('./home.vue'),
};
