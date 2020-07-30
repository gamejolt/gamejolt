import { RouteConfig } from 'vue-router';

export const routeTimeout: RouteConfig = {
	name: 'timeout',
	path: '/timeout',
	component: () => import(/* webpackChunkName: "routeTimeout" */ './timeout.vue'),
	meta: {
		isFullPage: true,
	},
};
