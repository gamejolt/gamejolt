import { RouteRecordRaw } from 'vue-router';
import { routeForumsChannelsView } from './channels/view/view.route';
import { routeForumsLanding } from './landing/landing.route';
import { routeForumsTopicsView } from './topics/view/view.route';

export const routeForums: RouteRecordRaw = {
	path: '/forums',
	component: () => import('./forums'),
	children: [routeForumsLanding, routeForumsChannelsView, routeForumsTopicsView],
};
