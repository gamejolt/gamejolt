import { RouteConfig } from 'vue-router';

export const routePlayboxMain: RouteConfig = {
	name: 'playbox',
	path: '/playbox',
	component: () => import(/* webpackChunkName: "routePlayboxMain" */ './main.vue'),
};
