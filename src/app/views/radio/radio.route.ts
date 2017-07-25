import VueRouter from 'vue-router';

export const routeRadio: VueRouter.RouteConfig = {
	name: 'radio',
	path: '/radio',
	props: true,
	component: () => import(/* webpackChunkName: "routeRadio" */ './radio'),
};
