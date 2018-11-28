import { RouteConfig } from 'vue-router';

export const routeActivityNotifications: RouteConfig = {
	name: 'activity.notifications',
	path: '/notifications',
	// Keep all activity in same chunk name.
	component: () => import(/* webpackChunkName: "routeActivity" */ './notifications'),
};
