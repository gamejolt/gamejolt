import { RouteRecordRaw } from 'vue-router';

export const routeAuthJoinCaptcha: RouteRecordRaw = {
	name: 'auth.join-captcha',
	path: '/join/captcha',
	component: () => import('~auth/views/auth/join-captcha/RouteJoinCaptcha.vue'),
	meta: {
		hideCoverImage: true,
	},
};
