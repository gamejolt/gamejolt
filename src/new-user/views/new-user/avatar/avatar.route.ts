import { RouteConfig } from 'vue-router';

export const routeNewUserAvatar: RouteConfig = {
	name: 'new-user.avatar',
	path: '/',
	component: () => import(/* webpackChunkName: "routeNewUserAvatar" */ './avatar'),
};
