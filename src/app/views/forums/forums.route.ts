import { RouteConfig } from 'vue-router';

import { routeForumsLanding } from './landing/landing.route';
import { routeForumsChannelsView } from './channels/view/view.route';
import { routeForumsTopicsView } from './topics/view/view.route';
import { routeForumsTopicsAdd } from './topics/add/add.route';

export const routeForums: RouteConfig = {
	path: '/forums',
	props: true,
	component: () => import(/* webpackChunkName: "routeForums" */ './forums'),
	children: [
		routeForumsLanding,
		routeForumsChannelsView,
		routeForumsTopicsAdd,
		routeForumsTopicsView,
	],
};
