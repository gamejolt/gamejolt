import { RouteConfig } from 'vue-router';

export const routeActivityFeed: RouteConfig = {
	name: 'activity.feed',
	path: '/activity',
	// Keep all activity in same chunk name.
	component: () => import(/* webpackChunkName: "routeActivity" */ './feed'),
};
