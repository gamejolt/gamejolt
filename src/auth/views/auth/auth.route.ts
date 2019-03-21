import { RouteConfig } from 'vue-router';
import RouteAuth from './auth.vue';
import { routeAuthAuthorize } from './authorize/authorize.route';
import { routeAuthForgotSent } from './forgot-sent/forgot-sent.route';
import { routeAuthForgot } from './forgot/forgot.route';
import { routeAuthJoinAlmost } from './join-almost/join-almost.route';
import { routeAuthJoinCaptcha } from './join-captcha/join-captcha.route';
import { routeAuthJoin } from './join/join.route';
import { routeAuthLinkedAccount } from './linked-account/linked-account.route';
import { routeAuthLogin } from './login/login.route';
import { routeAuthResetPassword } from './reset-password/reset-password.route';

export const routeAuth: RouteConfig = {
	path: '/',
	component: RouteAuth,
	children: [
		routeAuthLogin,
		routeAuthJoin,
		routeAuthJoinCaptcha,
		routeAuthJoinAlmost,
		routeAuthForgot,
		routeAuthForgotSent,
		routeAuthResetPassword,
		routeAuthAuthorize,
		routeAuthLinkedAccount,
	],
};
