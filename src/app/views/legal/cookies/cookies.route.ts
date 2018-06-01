import { RouteConfig } from 'vue-router';

export const routeLegalCookies: RouteConfig = {
	name: 'legal.cookies',
	path: '/cookies',
	props: true,
	component: () => import(/* webpackChunkName: "routeLegalCookies" */ './cookies'),
};
