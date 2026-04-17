import { RouteRecordRaw } from 'vue-router';

export const routeAuthResetPassword: RouteRecordRaw = {
	name: 'auth.reset-password',
	path: '/reset-password/:userId/:token',
	component: () => import('~auth/views/auth/reset-password/RouteAuthResetPassword.vue'),
	meta: {
		hideCoverImage: true,
	},
};
