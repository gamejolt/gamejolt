import { RouteRecordRaw } from 'vue-router';

export const routeTimeout: RouteRecordRaw = {
	name: 'timeout',
	path: '/timeout',
	component: () => import(/* webpackChunkName: "routeTimeout" */ './timeout.vue'),
	meta: {
		isFullPage: true,
	},
};
