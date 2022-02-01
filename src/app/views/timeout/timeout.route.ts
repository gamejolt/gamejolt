import { RouteRecordRaw } from 'vue-router';

export const routeTimeout: RouteRecordRaw = {
	name: 'timeout',
	path: '/timeout',
	component: () => import('./timeout.vue'),
	meta: {
		isFullPage: true,
	},
};
