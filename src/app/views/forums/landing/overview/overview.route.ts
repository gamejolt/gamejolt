import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';

export const routeForumsLandingOverview: VueRouter.RouteConfig = {
	name: 'forums.landing.overview',
	path: '/forums',
	component: () => asyncComponentLoader( $import( './overview' ) ),
	children: [
		{ path: '/community/forums', redirect: { name: 'forums.landing.overview' } },
		{ path: '/community/forums/rules', redirect: { name: 'forums.landing.overview' } },
	],
};
