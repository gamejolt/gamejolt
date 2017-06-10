import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';

export const routeDashMainOverview: VueRouter.RouteConfig = {
	name: 'dash.main.overview',
	path: '/dashboard',
	props: true,
	component: () => asyncComponentLoader( $import( './overview' ) ),
};
