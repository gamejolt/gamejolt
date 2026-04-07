import { RouteRecordRaw } from 'vue-router';

export const routeAuthForgot: RouteRecordRaw = {
	name: 'auth.forgot',
	path: '/forgot',
	component: () => import('./RouteAuthForgot.vue'),
	meta: {
		hideCoverImage: true,
	},
};
