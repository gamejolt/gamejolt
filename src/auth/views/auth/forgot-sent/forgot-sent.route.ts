import { RouteRecordRaw } from 'vue-router';

export const routeAuthForgotSent: RouteRecordRaw = {
	name: 'auth.forgot-sent',
	path: '/forgot/sent',
	component: () => import('~auth/views/auth/forgot-sent/RouteAuthForgotSent.vue'),
	meta: {
		hideCoverImage: true,
	},
};
