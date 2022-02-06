import { RouteRecordRaw } from 'vue-router';

export const routeTimeout: RouteRecordRaw = {
	name: 'timeout',
	path: '/timeout',
	component: () => import('./RouteTimeout.vue'),
	meta: {
		isFullPage: true,
	},
};
