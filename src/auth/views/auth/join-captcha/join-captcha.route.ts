import { RouteRecordRaw } from 'vue-router';

export const routeAuthJoinCaptcha: RouteRecordRaw = {
	name: 'auth.join-captcha',
	path: '/join/captcha',
	component: () => import('./join-captcha.vue'),
	meta: {
		hideCoverImage: true,
	},
};
