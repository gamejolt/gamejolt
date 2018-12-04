import { RouteConfig } from 'vue-router';

export const routeAuthAuthorize: RouteConfig = {
	name: 'auth.authorize',
	path: 'authorize/:userId/:code/:type',
	component: () => import(/* webpackChunkName: "routeAuthAuthorize" */ './authorize'),
	meta: {
		hideCoverImage: true,
	},
};
