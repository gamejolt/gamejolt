import { RouteRecordRaw } from 'vue-router';

export const routeAuthResetPassword: RouteRecordRaw = {
	name: 'auth.reset-password',
	path: '/reset-password/:userId/:token',
	component: () => import('./RouteAuthResetPassword.vue'),
	meta: {
		hideCoverImage: true,
	},
};
