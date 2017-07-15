import VueRouter from 'vue-router';

export const routeAuthAuthorize: VueRouter.RouteConfig = {
	name: 'auth.authorize',
	path: 'authorize/:userId/:code/:type',
	props: true,
	component: () => import('./authorize'),
	meta: {
		hideCoverImage: true,
	},
};
