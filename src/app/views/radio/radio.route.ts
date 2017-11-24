import { RouteConfig } from 'vue-router';

export const routeRadio: RouteConfig = {
	name: 'radio',
	path: '/radio',
	props: true,
	component: () => import(/* webpackChunkName: "routeRadio" */ './radio'),
};
