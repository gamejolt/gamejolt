import { RouteConfig } from 'vue-router';

export const routeLegalCookies: RouteConfig = {
	name: 'legal.cookies',
	path: '/cookies',
	component: () => import(/* webpackChunkName: "routeLegalCookies" */ './cookies'),
};
