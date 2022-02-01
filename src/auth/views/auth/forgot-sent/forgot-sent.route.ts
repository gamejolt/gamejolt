import { RouteRecordRaw } from 'vue-router';

export const routeAuthForgotSent: RouteRecordRaw = {
	name: 'auth.forgot-sent',
	path: '/forgot/sent',
	component: () => import('./forgot-sent.vue'),
	meta: {
		hideCoverImage: true,
	},
};
