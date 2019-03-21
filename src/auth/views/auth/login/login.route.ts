import { RouteConfig } from 'vue-router';

export const routeAuthLogin: RouteConfig = {
	name: 'auth.login',
	path: 'login',
	component: () => import(/* webpackChunkName: "routeAuthLogin" */ './login.vue'),
};
