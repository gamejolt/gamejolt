import { RouteConfig } from 'vue-router';

export const routeDiscoverFiresides: RouteConfig = {
	name: 'discover.firesides',
	path: '/firesides',
	component: () => import(/* webpackChunkName: "routeDiscoverFiresides" */ './firesides.vue'),
};
