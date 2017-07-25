import VueRouter from 'vue-router';

export const routeAuthForgotSent: VueRouter.RouteConfig = {
	name: 'auth.forgot-sent',
	path: 'forgot/sent',
	props: true,
	component: () => import(/* webpackChunkName: "routeAuthForgotSent" */ './forgot-sent'),
	meta: {
		hideCoverImage: true,
	},
};
