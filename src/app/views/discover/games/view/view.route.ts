import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../lib/gj-lib-client/utils/utils';
import { routeDiscoverGamesViewOverview } from './overview/overview.route';
import { routeDiscoverGamesViewDevlogList } from './devlog/list/list.route';
import { routeDiscoverGamesViewDevlogView } from './devlog/view/view.route';

export const routeDiscoverGamesView: VueRouter.RouteConfig = {
	path: ':slug/:id(\\d+)',
	props: true,
	component: () => asyncComponentLoader( $import( './view' ) ),
	children: [
		routeDiscoverGamesViewOverview,
		routeDiscoverGamesViewDevlogList,
		routeDiscoverGamesViewDevlogView,
	],
};
