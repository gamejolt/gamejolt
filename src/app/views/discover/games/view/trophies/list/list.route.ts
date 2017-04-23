import VueRouter from 'vue-router';
import { asyncComponentLoader } from '../../../../../../../lib/gj-lib-client/utils/utils';

export const routeDiscoverGamesViewTrophiesList: VueRouter.RouteConfig = {
	name: 'discover.games.view.trophies.list',
	path: 'trophies',
	props: true,
	component: () => asyncComponentLoader( $import( './list' ) ),
};
