import { RouteRecordRaw } from 'vue-router';

export const routeAuthJoinCaptcha: RouteRecordRaw = {
	name: 'auth.join-captcha',
	path: '/join/captcha',
	component: () => import('./RouteJoinCaptcha.vue'),
	meta: {
		hideCoverImage: true,
	},
};
