import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';
import { routeForumsLandingOverview } from './overview/overview.route';
import { routeForumsLandingActive } from './active/active.route';

export const routeForumsLanding: VueRouter.RouteConfig = {
	name: 'forums.landing',
	path: '',
	props: true,
	component: () => asyncComponentLoader( $import( './landing' ) ),
	children: [
		routeForumsLandingOverview,
		routeForumsLandingActive,
	],
};
