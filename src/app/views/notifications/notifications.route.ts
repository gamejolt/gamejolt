import { RouteConfig } from 'vue-router';

export const routeNotifications: RouteConfig = {
	name: 'notifications',
	path: '/notifications',
	props: true,
	component: () => import(/* webpackChunkName: "routeNotifications" */ './notifications'),
};
