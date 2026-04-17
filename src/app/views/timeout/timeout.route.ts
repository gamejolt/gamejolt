import { RouteRecordRaw } from 'vue-router';

export const routeTimeout: RouteRecordRaw = {
	name: 'timeout',
	path: '/timeout',
	component: () => import('~app/views/timeout/RouteTimeout.vue'),
	meta: {
		isFullPage: true,
	},
};
