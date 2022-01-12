import { RouteRecordRaw } from 'vue-router';

export const routeAuthForgot: RouteRecordRaw = {
	name: 'auth.forgot',
	path: '/forgot',
	component: () => import('./forgot.vue'),
	meta: {
		hideCoverImage: true,
	},
};
