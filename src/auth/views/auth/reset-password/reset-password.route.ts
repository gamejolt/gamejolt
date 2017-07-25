import VueRouter from 'vue-router';

export const routeAuthResetPassword: VueRouter.RouteConfig = {
	name: 'auth.reset-password',
	path: 'reset-password/:userId/:token',
	props: true,
	component: () => import(/* webpackChunkName: "routeAuthResetPassword" */ './reset-password'),
	meta: {
		hideCoverImage: true,
	},
};
