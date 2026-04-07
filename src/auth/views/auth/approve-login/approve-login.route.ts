import { RouteConfig } from 'vue-router';

export const routeAuthApproveLogin: RouteConfig = {
	name: 'auth.approve-login',
	path: '/login/approve',
	component: () => import('./RouteApproveLogin.vue'),
	meta: {
		hideCoverImage: true,
	},
};
