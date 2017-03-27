import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../lib/gj-lib-client/utils/utils';
import { routeProfileOverview } from './overview/overview.route';

export const routeProfile: VueRouter.RouteConfig = {
	name: 'profile',
	path: '/@:username',
	props: true,
	component: () => asyncComponentLoader( $import( './profile' ) ),
	children: [
		routeProfileOverview,
	],
};
