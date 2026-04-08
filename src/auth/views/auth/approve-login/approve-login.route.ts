import { RouteRecordRaw } from 'vue-router';

export const routeAuthApproveLogin: RouteRecordRaw = {
	name: 'auth.approve-login',
	path: '/login/approve',
	component: () => import('./RouteApproveLogin.vue'),
	meta: {
		hideCoverImage: true,
	},
};
