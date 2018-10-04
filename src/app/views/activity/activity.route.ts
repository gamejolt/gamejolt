import { RouteConfig } from 'vue-router';
import { routeActivityFeed } from './feed/feed.route';
import { routeActivityNotifications } from './notifications/notifications.route';

export const routeActivity: RouteConfig = {
	path: '',
	props: true,
	// Keep all activity in same chunk name.
	component: () => import(/* webpackChunkName: "routeActivity" */ './activity'),
	children: [routeActivityFeed, routeActivityNotifications],
};
