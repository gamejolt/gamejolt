import { RouteConfig } from 'vue-router';

export const routeNotifications: RouteConfig = {
	name: 'notifications',
	path: '/notifications',
	component: () => import(/* webpackChunkName: "routeNotifications" */ './notifications.vue'),
};
