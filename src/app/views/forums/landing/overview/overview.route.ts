import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';

export const routeForumsLandingOverview: VueRouter.RouteConfig = {
	name: 'forums.landing.overview',
	path: '/forums',
	component: () => asyncComponentLoader( $import( './overview' ) ),
};
