import { RouteConfig } from 'vue-router';

export const routeAuthResetPassword: RouteConfig = {
	name: 'auth.reset-password',
	path: 'reset-password/:userId/:token',
	component: () =>
		import(/* webpackChunkName: "routeAuthResetPassword" */ './reset-password.vue'),
	meta: {
		hideCoverImage: true,
	},
};
