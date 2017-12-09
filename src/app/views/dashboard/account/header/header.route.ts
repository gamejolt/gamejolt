import { RouteConfig } from 'vue-router';

export const routeDashAccountHeader: RouteConfig = {
	name: 'dash.account.header',
	path: 'profile/header',
	props: true,
	component: () => import(/* webpackChunkName: "routeDashAccountHeader" */ './header'),
};
