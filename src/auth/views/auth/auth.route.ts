import { RouteConfig } from 'vue-router';

import RouteAuth from './auth';
import { routeAuthLogin } from './login/login.route';
import { routeAuthJoin } from './join/join.route';
import { routeAuthForgot } from './forgot/forgot.route';
import { routeAuthForgotSent } from './forgot-sent/forgot-sent.route';
import { routeAuthJoinAlmost } from './join-almost/join-almost.route';
import { routeAuthResetPassword } from './reset-password/reset-password.route';
import { routeAuthAuthorize } from './authorize/authorize.route';
import { routeAuthLinkedAccount } from './linked-account/linked-account.route';

export const routeAuth: RouteConfig = {
	path: '/',
	props: true,
	component: RouteAuth,
	children: [
		routeAuthLogin,
		routeAuthJoin,
		routeAuthJoinAlmost,
		routeAuthForgot,
		routeAuthForgotSent,
		routeAuthResetPassword,
		routeAuthAuthorize,
		routeAuthLinkedAccount,
	],
};
