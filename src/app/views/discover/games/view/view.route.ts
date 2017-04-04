import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';
import { routeDiscoverGamesViewOverview } from './overview/overview.route';

export const routeDiscoverGamesView: VueRouter.RouteConfig = {
	path: ':slug/:id(\\d+)',
	props: true,
	component: () => asyncComponentLoader( $import( './view' ) ),
	children: [
		routeDiscoverGamesViewOverview,
	],
};
