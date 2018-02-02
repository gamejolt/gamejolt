import { RouteConfig } from 'vue-router';

export const routeAuthJoinCaptcha: RouteConfig = {
	name: 'auth.join-captcha',
	path: 'join/captcha',
	props: true,
	component: () => import(/* webpackChunkName: "routeAuthJoinAlmost" */ './join-captcha'),
	meta: {
		hideCoverImage: true,
	},
};
