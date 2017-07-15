import VueRouter from 'vue-router';

export const routeAuthLogin: VueRouter.RouteConfig = {
	name: 'auth.login',
	path: 'login',
	props: true,
	component: () => import('./login'),
};
