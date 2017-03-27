import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../lib/gj-lib-client/utils/utils';

export const routeProfileOverview: VueRouter.RouteConfig = {
	name: 'profile.overview',
	path: '/@:username',
	component: () => asyncComponentLoader( $import( './overview' ) ),
};
