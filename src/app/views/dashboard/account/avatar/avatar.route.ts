import { RouteConfig } from 'vue-router';

export const routeDashAccountAvatar: RouteConfig = {
	name: 'dash.account.avatar',
	path: 'profile/avatar',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashAccountAvatar" */ './avatar'),
};
