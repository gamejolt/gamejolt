import VueRouter from 'vue-router';

export const routeAuthForgot: VueRouter.RouteConfig = {
	name: 'auth.forgot',
	path: 'forgot',
	props: true,
	component: () => import(/* webpackChunkName: "routeAuthForgot" */ './forgot'),
	meta: {
		hideCoverImage: true,
	},
};
