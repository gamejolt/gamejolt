import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../lib/gj-lib-client/utils/utils';
import { routeForumsLanding } from './landing/landing.route';
import { routeForumsChannelsView } from './channels/view/view.route';
import { routeForumsTopicsView } from './topics/view/view.route';
import { routeForumsTopicsAdd } from './topics/add/add.route';

export const routeForums: VueRouter.RouteConfig = {
	name: 'forums',
	path: '/forums',
	props: true,
	component: () => asyncComponentLoader( $import( './forums' ) ),
	children: [
		routeForumsLanding,
		routeForumsChannelsView,
		routeForumsTopicsAdd,
		routeForumsTopicsView,
	],
};
