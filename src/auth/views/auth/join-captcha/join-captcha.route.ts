import { RouteRecordRaw } from 'vue-router';

export const routeAuthJoinCaptcha: RouteRecordRaw = {
	name: 'auth.join-captcha',
	path: '/join/captcha',
	component: () => import(/* webpackChunkName: "routeAuthJoinAlmost" */ './join-captcha.vue'),
	meta: {
		hideCoverImage: true,
	},
};
