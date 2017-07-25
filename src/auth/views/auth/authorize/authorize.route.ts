import VueRouter from 'vue-router';

export const routeAuthAuthorize: VueRouter.RouteConfig = {
	name: 'auth.authorize',
	path: 'authorize/:userId/:code/:type',
	props: true,
	component: () => import(/* webpackChunkName: "routeAuthAuthorize" */ './authorize'),
	meta: {
		hideCoverImage: true,
	},
};
