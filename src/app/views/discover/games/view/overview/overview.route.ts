import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../lib/gj-lib-client/utils/utils';

export const routeDiscoverGamesViewOverview: VueRouter.RouteConfig = {
	name: 'discover.games.view.overview',
	path: '/games/:slug/:id(\\d+)',
	props: true,
	component: () => asyncComponentLoader( $import( './overview' ) ),
};
