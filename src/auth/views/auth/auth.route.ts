import { RouteRecordRaw } from 'vue-router';

import { routeAuthApproveLogin } from '~auth/views/auth/approve-login/approve-login.route';
import { routeAuthAuthorize } from '~auth/views/auth/authorize/authorize.route';
import { routeAuthForgot } from '~auth/views/auth/forgot/forgot.route';
import { routeAuthForgotSent } from '~auth/views/auth/forgot-sent/forgot-sent.route';
import { routeAuthJoin } from '~auth/views/auth/join/join.route';
import { routeAuthJoinAlmost } from '~auth/views/auth/join-almost/join-almost.route';
import { routeAuthJoinCaptcha } from '~auth/views/auth/join-captcha/join-captcha.route';
import { routeAuthLinkedAccount } from '~auth/views/auth/linked-account/linked-account.route';
import { routeAuthLogin } from '~auth/views/auth/login/login.route';
import { routeAuthResetPassword } from '~auth/views/auth/reset-password/reset-password.route';
import RouteAuth from '~auth/views/auth/RouteAuth.vue';

export const routeAuth: RouteRecordRaw = {
	path: '/login',
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
		routeAuthApproveLogin,
	],
};
