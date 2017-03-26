import VueRouter from 'vue-router';

import RouteAuth from './auth';
import { routeAuthLogin } from './login/login.route';
import { routeAuthJoin } from './join/join.route';
import { routeAuthForgot } from './forgot/forgot.route';
import { routeAuthForgotSent } from './forgot-sent/forgot-sent.route';
import { routeAuthJoinAlmost } from './join-almost/join-almost.route';

export const routeAuth: VueRouter.RouteConfig = {
	name: 'auth',
	path: '/',
	component: RouteAuth,
	children: [
		routeAuthLogin,
		routeAuthJoin,
		routeAuthJoinAlmost,
		routeAuthForgot,
		routeAuthForgotSent,
	],
};
