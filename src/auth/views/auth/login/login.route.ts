import { RouteConfig } from 'vue-router';

export const routeAuthLogin: RouteConfig = {
	name: 'auth.login',
	path: 'login',
	props: true,
	component: () => import(/* webpackChunkName: "routeAuthLogin" */ './login'),
};
