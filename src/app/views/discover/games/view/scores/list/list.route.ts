import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDiscoverGamesViewScoresList: VueRouter.RouteConfig = {
	name: 'discover.games.view.scores.list',
	path: 'scores/:tableId(\\d+)/:type',
	component: () => asyncComponentLoader( $import( './list' ) ),
};
