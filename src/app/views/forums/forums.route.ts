import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../lib/gj-lib-client/utils/utils';
import { routeForumsLanding } from './landing/landing.route';

export const routeForums: VueRouter.RouteConfig = {
	name: 'forums',
	path: '/forums',
	component: () => asyncComponentLoader( $import( './forums' ) ),
	children: [
		routeForumsLanding,
	],
};
